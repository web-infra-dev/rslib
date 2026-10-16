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
type Program = NonNullable<Snapshot['operation']['createdPrograms']>[number];
type NewApiSession = {
  api: InstanceType<NewApiModule['API']>;
  formatDiagnostics: NewApiModule['formatDiagnosticsWithColorAndContext'];
  snapshot?: Snapshot;
  program?: Program;
  sourceFiles?: string;
  dependencies?: string[];
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
  let session = isWatch ? watchSession : undefined;
  if (!session) {
    const require = createRequire(typescriptPath!);
    const apiPath = require.resolve('typescript/sync');
    const { API, formatDiagnosticsWithColorAndContext } = (await import(
      pathToFileURL(apiPath).href
    )) as NewApiModule;
    session = {
      api: new API({ cwd }),
      formatDiagnostics: formatDiagnosticsWithColorAndContext,
    };
  }
  if (isWatch) {
    watchSession = session;
  }
  const { api, formatDiagnostics } = session;
  let hasErrors: boolean;

  try {
    const config = api.parseConfigFile(configPath);
    const programOptions = {
      rootFiles: config.fileNames,
      compilerOptions: {
        ...config.options,
        paths,
        noEmit: false,
        declaration: true,
        declarationDir: path.resolve(cwd, declarationDir),
        emitDeclarationOnly: true,
      },
      options: {
        projectReferences: config.projectReferences,
        configFileParsingDiagnostics: config.errors,
      },
    };
    const previousSnapshot = session.snapshot;
    if (previousSnapshot && session.program) {
      const snapshot = previousSnapshot.update({
        fileNotifications: fileChanges
          ? {
              changed: fileChanges.changed,
              created: fileChanges.created,
              deleted: fileChanges.deleted,
            }
          : { invalidateAll: true },
        // Synthetic programs do not refresh automatically from file changes.
        // Reconfigure their inputs while retaining the snapshot's filesystem
        // and the API server across rebuilds.
        reconfigurePrograms: [{ id: session.program.id, ...programOptions }],
      });
      session.snapshot = snapshot;
      session.program = snapshot.getProgram(session.program.id) as Program;
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
        session.dependencies = fileNames.filter((_file, index) => {
          const file = metadata[index];
          return file && !file.isDefaultLibrary && !file.isFromExternalLibrary;
        });
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
        directories: [
          ...new Set(session.dependencies!.map((file) => path.dirname(file))),
        ],
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
          [...outputFiles.keys()].filter((file) => file.endsWith(dtsExtension)),
        fileExists: async (file) => outputFiles.has(file) || pathExists(file),
        isDirectory: async (directory) =>
          outputDirectories.has(directory) || isDirectory(directory),
      },
    );
    for (const [fileName, contents] of outputFiles) {
      fs.mkdirSync(path.dirname(fileName), { recursive: true });
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
