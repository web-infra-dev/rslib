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
type SyntheticProjectId = import('typescript7-api/sync').SyntheticProjectId;
type Program = import('typescript7-api/sync').Program;
type NewApiSession = {
  api: InstanceType<NewApiModule['API']>;
  formatDiagnostics: NewApiModule['formatDiagnosticsWithColorAndContext'];
  snapshot?: Snapshot;
  program?: Program;
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
    session.api.close();
    watchSession = undefined;
    session = undefined;
  }
  if (!session) {
    const require = createRequire(typescriptPath!);
    const apiPath = require.resolve('typescript/sync');
    const { API, formatDiagnosticsWithColorAndContext } = (await import(
      pathToFileURL(apiPath).href
    )) as NewApiModule;
    session = {
      api: new API({ cwd, runExternalCode: hasContentMappers }),
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
    const compilerOptionsOverrides = {
      paths,
      noEmit: false,
      declaration: true,
      declarationDir: path.resolve(cwd, declarationDir),
      emitDeclarationOnly: true,
    };
    const programOptions = {
      rootFiles: config.fileNames,
      compilerOptions: { ...config.options, ...compilerOptionsOverrides },
      options: {
        projectReferences: config.projectReferences,
        configFileParsingDiagnostics: config.errors,
      },
    };
    const previousSnapshot = session.snapshot;
    if (hasContentMappers) {
      const rawConfig = (config.raw ?? {}) as {
        compilerOptions?: Record<string, unknown>;
      };
      // Configured projects retain content mapper registrations. Override only
      // declaration options in memory, leaving the user's tsconfig untouched.
      const changes = {
        openProjects: [configPath],
        ensurePrograms: true as const,
        fileNotifications: fileChanges ?? { invalidateAll: true },
        fileSystem: {
          kind: 'layer' as const,
          files: {
            [configPath]: JSON.stringify({
              ...rawConfig,
              compilerOptions: {
                ...rawConfig.compilerOptions,
                ...compilerOptionsOverrides,
              },
            }),
          },
        },
      };
      const snapshot = previousSnapshot
        ? previousSnapshot.update(changes)
        : api.createSnapshot(changes);
      session.snapshot = snapshot;
      session.program = snapshot.getConfiguredProject(configPath)?.program;
      if (previousSnapshot && snapshot !== previousSnapshot) {
        previousSnapshot.dispose();
      }
    } else if (previousSnapshot && session.program) {
      const snapshot = previousSnapshot.update({
        fileNotifications: fileChanges ?? { invalidateAll: true },
        // Synthetic programs do not refresh automatically from file changes.
        // Reconfigure their inputs while retaining the snapshot's filesystem
        // and the API server across rebuilds.
        reconfigurePrograms: [
          {
            id: session.program.id as SyntheticProjectId,
            ...programOptions,
          },
        ],
      });
      session.snapshot = snapshot;
      session.program = snapshot.getProgram(session.program.id);
      if (snapshot !== previousSnapshot) {
        previousSnapshot.dispose();
      }
    } else {
      const snapshot = api.createSnapshot({
        ...(isWatch ? { openProjects: [configPath] } : {}),
        createPrograms: [programOptions],
      });
      session.snapshot = snapshot;
      session.program = snapshot.operation.createdPrograms[0];
    }
    const program = session.program;
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
          ...(session
            .snapshot!.getConfiguredProject(configPath)
            ?.program.getConfigFileNames() ?? []),
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
      api.close();
    }
    throw error;
  } finally {
    if (!isWatch) {
      api.close();
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
