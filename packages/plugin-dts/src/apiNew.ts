import { logger } from '@rsbuild/core';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { EmitDtsOptions } from './dts';
import type {
  DtsGenOptions,
  DtsWatchDependencies,
  TsconfigOptionsResult,
} from './types/internal';
import {
  color,
  getTimeCost,
  isDirectory,
  pathExists,
  processDtsFiles,
  renameDtsFile,
  updateDeclarationMapContent,
} from './utils';

type NewApiModule = typeof import('typescript7-api/sync');
type Snapshot = import('typescript7-api/sync').Snapshot;
type NewApiSession = {
  api: InstanceType<NewApiModule['API']>;
  formatDiagnostics: NewApiModule['formatDiagnosticsWithColorAndContext'];
  snapshot?: Snapshot;
  createFileSystemLayer: typeof import('typescript7-api/fs').createFileSystemLayer;
  close(): void;
  configContents?: string;
  hasContentMappers: boolean;
  sourceFiles?: string;
  dependencies?: string[];
  directories?: string[];
  watchDependencies?: DtsWatchDependencies;
};

export let watchSession: NewApiSession | undefined;

// Resolve relative to the selected TypeScript package, including typescriptPath
// overrides. The API client and its native server must use the same version.
export async function emitDtsWithNewApi(
  options: EmitDtsOptions<TsconfigOptionsResult>,
  bundle = false,
  isWatch = false,
  fileChanges?: DtsGenOptions['fileChanges'],
): Promise<boolean> {
  const start = Date.now();
  const {
    cwd,
    configPath,
    typescriptPath,
    declarationDir,
    dtsExtension,
    redirect,
    rootDir,
    paths,
    banner,
    footer,
    name,
  } = options;
  const hasContentMappers = !!options.tsConfigResult.contentMappers?.length;
  let session = isWatch ? watchSession : undefined;
  if (session && session.hasContentMappers !== hasContentMappers) {
    session.close();
    watchSession = undefined;
    session = undefined;
  }
  if (!session) {
    const require = createRequire(typescriptPath!);
    const apiPath = require.resolve('typescript/sync');
    const { API, formatDiagnosticsWithColorAndContext } = (await import(
      pathToFileURL(apiPath).href
    )) as NewApiModule;
    const { createFileSystemLayer } = (await import(
      pathToFileURL(require.resolve('typescript/fs')).href
    )) as typeof import('typescript7-api/fs');
    const api = new API({ cwd, runExternalCode: hasContentMappers });
    session = {
      api,
      createFileSystemLayer,
      close() {
        try {
          api.close();
        } catch (error) {
          // Cleanup must not mask a compilation error if the server has exited.
          logger.debug('Failed to close the TypeScript API:', error);
        }
      },
      formatDiagnostics: formatDiagnosticsWithColorAndContext,
      hasContentMappers,
    };
  }
  if (isWatch) {
    watchSession = session;
  }
  const { api, formatDiagnostics } = session;
  let hasErrors: boolean;

  try {
    const config = api.parseConfigFile(configPath);
    const rawConfig = (config.raw ?? {}) as {
      compilerOptions?: Record<string, unknown>;
    };
    // Override declaration options in memory without changing the user's config.
    const configContents = JSON.stringify({
      ...rawConfig,
      compilerOptions: {
        ...rawConfig.compilerOptions,
        paths,
        noEmit: false,
        declaration: true,
        declarationDir: path.resolve(cwd, declarationDir),
        emitDeclarationOnly: true,
      },
    });
    const previousSnapshot = session.snapshot;
    const changes = {
      openProjects: [configPath],
      ensurePrograms: true as const,
      fileNotifications: fileChanges ?? { invalidateAll: true },
      ...(configContents !== session.configContents
        ? {
            fileSystem: session.createFileSystemLayer([
              [configPath, configContents],
            ]),
          }
        : {}),
    };
    const snapshot = previousSnapshot
      ? previousSnapshot.update(changes)
      : api.createSnapshot(changes);
    session.snapshot = snapshot;
    session.configContents = configContents;
    if (previousSnapshot && snapshot !== previousSnapshot) {
      previousSnapshot.dispose();
    }
    const program = snapshot.getConfiguredProject(configPath)?.program;
    if (!program) {
      throw new Error('Failed to create the TypeScript declaration program.');
    }

    if (isWatch) {
      const fileNames = program.getSourceFileNames();
      const sourceFiles = JSON.stringify(fileNames);
      if (sourceFiles !== session.sourceFiles) {
        const metadata = fileNames.map((file) =>
          program.getSourceFileMetadata(file),
        );
        const directories = new Set<string>();
        session.dependencies = fileNames.filter((fileName, index) => {
          const file = metadata[index];
          if (!file || file.isDefaultLibrary) return false;
          if (!file.isFromExternalLibrary) {
            directories.add(path.dirname(fileName));
          }
          return true;
        });
        session.directories = [...directories];
        session.sourceFiles = sourceFiles;
      }
      session.watchDependencies = {
        dependencies: [
          ...session.dependencies!,
          configPath,
          ...program.getConfigFileNames(),
        ],
        directories: session.directories!,
      };
    }

    const diagnostics = api
      .batch(
        program.getConfigFileParsingDiagnostics.gen(),
        program.getSyntacticDiagnostics.gen(),
        program.getProgramDiagnostics.gen(),
        program.getGlobalDiagnostics.gen(),
        program.getSemanticDiagnostics.gen(),
        program.getDeclarationDiagnostics.gen(),
      )
      .flat();
    const result = program.emitToString();
    diagnostics.push(...result.diagnostics);
    hasErrors = diagnostics.length > 0 || result.emitSkipped;

    const outputFiles = new Map<string, string>();
    const outputDirectories = new Set<string>();
    for (const [fileName, file] of result.outputFiles) {
      const outputPath = path.normalize(
        renameDtsFile(fileName, dtsExtension, bundle),
      );
      const contents = updateDeclarationMapContent(
        fileName,
        file.text,
        dtsExtension,
        bundle,
        config.options.declarationMap,
      );
      outputFiles.set(outputPath, contents);
      let directory = path.dirname(outputPath);
      while (!outputDirectories.has(directory)) {
        outputDirectories.add(directory);
        directory = path.dirname(directory);
      }
    }

    await processDtsFiles(
      bundle,
      cwd,
      declarationDir,
      dtsExtension,
      redirect,
      configPath,
      rootDir,
      paths,
      banner,
      footer,
      {
        readFile: async (file) => outputFiles.get(file)!,
        writeFile: async (file, content) => {
          outputFiles.set(file, content);
        },
        getFiles: async () =>
          [...outputFiles.keys()].filter(
            (file) =>
              file.endsWith(dtsExtension) || /\.d\.[^/\\]+\.ts$/.test(file),
          ),
        fileExists: async (file) => outputFiles.has(file) || pathExists(file),
        isDirectory: async (directory) =>
          outputDirectories.has(directory) || isDirectory(directory),
      },
    );
    const createdDirectories = new Set<string>();
    for (const [fileName, contents] of outputFiles) {
      const directory = path.dirname(fileName);
      if (!createdDirectories.has(directory)) {
        fs.mkdirSync(directory, { recursive: true });
        createdDirectories.add(directory);
      }
      fs.writeFileSync(fileName, contents);
    }

    const messages = new Set(
      diagnostics.map((diagnostic) => formatDiagnostics([diagnostic], api)),
    );
    for (const message of messages) {
      logger.error(color.dim('[tsgo]'), message);
    }
  } catch (error) {
    if (isWatch) {
      watchSession = undefined;
      session.close();
    }
    throw error;
  } finally {
    if (!isWatch) {
      session.close();
    }
  }

  if (hasErrors && !isWatch) {
    const error = new Error(
      `Failed to generate declaration files. ${color.dim(`(${name})`)}`,
    );
    error.stack = '';
    throw error;
  }

  if (!hasErrors) {
    const message = `declaration files ${bundle ? 'prepared' : 'generated'} with tsgo in ${getTimeCost(start)} ${color.dim(`(${name})`)}`;
    if (bundle) {
      logger.info(message);
    } else {
      logger.ready(message);
    }
  }

  return hasErrors;
}
