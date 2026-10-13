import { logger } from '@rsbuild/core';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { EmitDtsOptions } from './dts';
import type { TsconfigOptionsResult } from './types/internal';
import {
  color,
  getTimeCost,
  processDtsFiles,
  renameDtsFile,
  updateDeclarationMapContent,
} from './utils';

// Resolve relative to the selected TypeScript package, including typescriptPath
// overrides. The API client and its native server must use the same version.
export async function emitDtsWithNewApi(
  options: EmitDtsOptions<TsconfigOptionsResult>,
  bundle = false,
  isWatch = false,
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
  const require = createRequire(typescriptPath!);
  const apiPath = require.resolve('typescript/sync');
  const { API, formatDiagnosticsWithColorAndContext } = (await import(
    pathToFileURL(apiPath).href
  )) as typeof import('typescript7-api/sync');
  const api = new API({ cwd });
  let hasErrors: boolean;

  try {
    const config = api.parseConfigFile(configPath);
    const program = api.createProgram(
      config.fileNames,
      {
        ...config.options,
        paths,
        noEmit: false,
        declaration: true,
        declarationDir: path.resolve(cwd, declarationDir),
        emitDeclarationOnly: true,
      },
      {
        projectReferences: config.projectReferences,
        configFileParsingDiagnostics: config.errors,
      },
    );

    try {
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

      for (const [fileName, file] of result.outputFiles) {
        const outputPath = renameDtsFile(fileName, dtsExtension, bundle);
        const contents = updateDeclarationMapContent(
          fileName,
          file.text,
          dtsExtension,
          bundle,
          config.options.declarationMap,
        );
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, contents);
      }

      const messages = new Set(
        diagnostics.map((diagnostic) =>
          formatDiagnosticsWithColorAndContext([diagnostic], api),
        ),
      );
      for (const message of messages) {
        logger.error(color.dim('[tsgo]'), message);
      }
    } finally {
      program.dispose();
    }
  } finally {
    api.close();
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
  );

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
