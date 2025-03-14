import { logger } from '@rsbuild/core';
import color from 'picocolors';
import ts from 'typescript';
import type { DtsRedirect } from './index';
import { getTimeCost, processDtsFiles } from './utils';

const logPrefixTsc = color.dim('[tsc]');

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (path) => path,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine,
};

export type EmitDtsOptions = {
  name: string;
  cwd: string;
  configPath: string;
  tsConfigResult: ts.ParsedCommandLine;
  declarationDir: string;
  dtsExtension: string;
  rootDir: string;
  redirect: DtsRedirect;
  banner?: string;
  footer?: string;
};

async function handleDiagnosticsAndProcessFiles(
  diagnostics: readonly ts.Diagnostic[],
  configPath: string,
  bundle: boolean,
  declarationDir: string,
  dtsExtension: string,
  redirect: DtsRedirect,
  rootDir: string,
  banner?: string,
  footer?: string,
  name?: string,
): Promise<void> {
  const diagnosticMessages: string[] = [];

  for (const diagnostic of diagnostics) {
    const message = ts.formatDiagnosticsWithColorAndContext(
      [diagnostic],
      formatHost,
    );
    diagnosticMessages.push(message);
  }

  await processDtsFiles(
    bundle,
    declarationDir,
    dtsExtension,
    redirect,
    configPath,
    rootDir,
    banner,
    footer,
  );

  if (diagnosticMessages.length) {
    for (const message of diagnosticMessages) {
      logger.error(logPrefixTsc, message);
    }

    throw new Error(
      `Failed to generate declaration files. ${color.gray(`(${name})`)}`,
    );
  }
}

export async function emitDts(
  options: EmitDtsOptions,
  onComplete: (isSuccess: boolean) => void,
  bundle = false,
  isWatch = false,
  build = false,
): Promise<void> {
  const start = Date.now();
  const {
    configPath,
    tsConfigResult,
    declarationDir,
    name,
    dtsExtension,
    rootDir,
    banner,
    footer,
    redirect,
  } = options;
  const {
    options: rawCompilerOptions,
    fileNames,
    projectReferences,
  } = tsConfigResult;

  const compilerOptions = {
    ...rawCompilerOptions,
    configFilePath: configPath,
    noEmit: false,
    declaration: true,
    declarationDir,
    emitDeclarationOnly: true,
  };

  const createProgram = ts.createSemanticDiagnosticsBuilderProgram;

  const reportDiagnostic = (diagnostic: ts.Diagnostic) => {
    logger.error(
      logPrefixTsc,
      ts.formatDiagnosticsWithColorAndContext([diagnostic], formatHost),
    );
  };

  const reportWatchStatusChanged: ts.WatchStatusReporter = async (
    diagnostic: ts.Diagnostic,
    _newLine: string,
    _options: ts.CompilerOptions,
    errorCount?: number,
  ) => {
    const message = `${ts.flattenDiagnosticMessageText(
      diagnostic.messageText,
      formatHost.getNewLine(),
    )} ${color.gray(`(${name})`)}`;

    // 6031: File change detected. Starting incremental compilation...
    // 6032: Starting compilation in watch mode...
    if (diagnostic.code === 6031 || diagnostic.code === 6032) {
      logger.info(logPrefixTsc, message);
    }

    // 6194: 0 errors or 2+ errors!
    if (diagnostic.code === 6194) {
      if (errorCount === 0 || !errorCount) {
        logger.info(logPrefixTsc, message);
        onComplete(true);
      } else {
        logger.error(logPrefixTsc, message);
      }
      await processDtsFiles(
        bundle,
        declarationDir,
        dtsExtension,
        redirect,
        configPath,
        rootDir,
        banner,
        footer,
      );
    }

    // 6193: 1 error
    if (diagnostic.code === 6193) {
      logger.error(logPrefixTsc, message);
      await processDtsFiles(
        bundle,
        declarationDir,
        dtsExtension,
        redirect,
        configPath,
        rootDir,
        banner,
        footer,
      );
    }
  };

  const system = { ...ts.sys };

  // build mode
  if (!isWatch) {
    // normal build - npx tsc
    if (!build && !compilerOptions.composite) {
      const host: ts.CompilerHost = ts.createCompilerHost(compilerOptions);

      const program: ts.Program = ts.createProgram({
        rootNames: fileNames,
        options: compilerOptions,
        projectReferences,
        host,
        configFileParsingDiagnostics:
          ts.getConfigFileParsingDiagnostics(tsConfigResult),
      });

      const emitResult = program.emit();

      const allDiagnostics = ts
        .getPreEmitDiagnostics(program)
        .concat(emitResult.diagnostics);

      await handleDiagnosticsAndProcessFiles(
        allDiagnostics,
        configPath,
        bundle,
        declarationDir,
        dtsExtension,
        redirect,
        rootDir,
        banner,
        footer,
        name,
      );
    } else if (!build && compilerOptions.composite) {
      // incremental build with composite true - npx tsc
      const host: ts.CompilerHost =
        ts.createIncrementalCompilerHost(compilerOptions);

      const program = ts.createIncrementalProgram({
        rootNames: fileNames,
        options: compilerOptions,
        configFileParsingDiagnostics:
          ts.getConfigFileParsingDiagnostics(tsConfigResult),
        projectReferences,
        host,
        createProgram,
      });

      program.emit();

      const allDiagnostics = program
        .getSemanticDiagnostics()
        .concat(program.getConfigFileParsingDiagnostics());

      await handleDiagnosticsAndProcessFiles(
        allDiagnostics,
        configPath,
        bundle,
        declarationDir,
        dtsExtension,
        redirect,
        rootDir,
        banner,
        footer,
        name,
      );
    } else {
      // incremental build with build project references
      // The equivalent of the `--build` flag for the tsc command.
      let errorNumber = 0;
      const reportErrorSummary = (errorCount: number) => {
        errorNumber = errorCount;
      };

      const host = ts.createSolutionBuilderHost(
        system,
        createProgram,
        reportDiagnostic,
        undefined,
        reportErrorSummary,
      );

      const solutionBuilder = ts.createSolutionBuilder(
        host,
        [configPath],
        compilerOptions,
      );

      solutionBuilder.build();

      await processDtsFiles(
        bundle,
        declarationDir,
        dtsExtension,
        redirect,
        configPath,
        rootDir,
        banner,
        footer,
      );

      if (errorNumber > 0) {
        throw new Error(
          `Failed to generate declaration files. ${color.gray(`(${name})`)}`,
        );
      }
    }

    if (bundle) {
      logger.info(
        `preparing declaration files in ${getTimeCost(start)} ${color.gray(`(${name})`)}`,
      );
    } else {
      logger.ready(
        `declaration files generated in ${getTimeCost(start)} ${color.gray(`(${name})`)}`,
      );
    }
  } else {
    // watch mode, can also deal with incremental build
    if (!build) {
      const host = ts.createWatchCompilerHost(
        configPath,
        compilerOptions,
        system,
        createProgram,
        reportDiagnostic,
        reportWatchStatusChanged,
      );

      ts.createWatchProgram(host);
    } else {
      // incremental build watcher with build project references
      const host = ts.createSolutionBuilderWithWatchHost(
        system,
        createProgram,
        reportDiagnostic,
        undefined,
        reportWatchStatusChanged,
      );

      const solutionBuilder = ts.createSolutionBuilderWithWatch(
        host,
        [configPath],
        compilerOptions,
        { watch: true },
      );

      solutionBuilder.build();
    }
  }
}
