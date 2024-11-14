import { logger } from '@rsbuild/core';
import color from 'picocolors';
import ts from 'typescript';
import {
  getFileLoc,
  getTimeCost,
  loadTsconfig,
  processDtsFiles,
} from './utils';

export type EmitDtsOptions = {
  name: string;
  cwd: string;
  configPath: string;
  declarationDir: string;
  dtsExtension: string;
  banner?: string;
  footer?: string;
};

async function handleDiagnosticsAndProcessFiles(
  diagnostics: readonly ts.Diagnostic[],
  configPath: string,
  host: ts.CompilerHost,
  bundle: boolean,
  declarationDir: string,
  dtsExtension: string,
  banner?: string,
  footer?: string,
  name?: string,
): Promise<void> {
  const diagnosticMessages: string[] = [];

  for (const diagnostic of diagnostics) {
    const fileLoc = getFileLoc(diagnostic, configPath);
    const message = `${fileLoc} - ${color.red('error')} ${color.gray(`TS${diagnostic.code}:`)} ${ts.flattenDiagnosticMessageText(
      diagnostic.messageText,
      host.getNewLine(),
    )}`;
    diagnosticMessages.push(message);
  }

  await processDtsFiles(bundle, declarationDir, dtsExtension, banner, footer);

  if (diagnosticMessages.length) {
    logger.error(
      `Failed to emit declaration files. ${color.gray(`(${name})`)}`,
    );

    for (const message of diagnosticMessages) {
      logger.error(message);
    }

    throw new Error('DTS generation failed');
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
  const { configPath, declarationDir, name, dtsExtension, banner, footer } =
    options;
  const configFileParseResult = loadTsconfig(configPath);
  const {
    options: rawCompilerOptions,
    fileNames,
    projectReferences,
  } = configFileParseResult;

  const compilerOptions = {
    ...rawCompilerOptions,
    configFilePath: configPath,
    noEmit: false,
    declaration: true,
    declarationDir,
    emitDeclarationOnly: true,
  };

  const createProgram = ts.createSemanticDiagnosticsBuilderProgram;
  const formatHost: ts.FormatDiagnosticsHost = {
    getCanonicalFileName: (path) => path,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => ts.sys.newLine,
  };

  const reportDiagnostic = (diagnostic: ts.Diagnostic) => {
    const fileLoc = getFileLoc(diagnostic, configPath);

    logger.error(
      `${fileLoc} - ${color.red('error')} ${color.gray(`TS${diagnostic.code}:`)}`,
      ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        formatHost.getNewLine(),
      ),
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
      logger.info(message);
    }

    // 6194: 0 errors or 2+ errors!
    if (diagnostic.code === 6194) {
      if (errorCount === 0 || !errorCount) {
        logger.info(message);
        onComplete(true);
      } else {
        logger.error(message);
      }
      await processDtsFiles(
        bundle,
        declarationDir,
        dtsExtension,
        banner,
        footer,
      );
    }

    // 6193: 1 error
    if (diagnostic.code === 6193) {
      logger.error(message);
      await processDtsFiles(
        bundle,
        declarationDir,
        dtsExtension,
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
        configFileParsingDiagnostics: ts.getConfigFileParsingDiagnostics(
          configFileParseResult,
        ),
      });

      const emitResult = program.emit();

      const allDiagnostics = ts
        .getPreEmitDiagnostics(program)
        .concat(emitResult.diagnostics);

      await handleDiagnosticsAndProcessFiles(
        allDiagnostics,
        configPath,
        host,
        bundle,
        declarationDir,
        dtsExtension,
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
        configFileParsingDiagnostics: ts.getConfigFileParsingDiagnostics(
          configFileParseResult,
        ),
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
        host,
        bundle,
        declarationDir,
        dtsExtension,
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
        banner,
        footer,
      );

      if (errorNumber > 0) {
        logger.error(
          `Failed to emit declaration files. ${color.gray(`(${name})`)}`,
        );

        throw new Error('DTS generation failed');
      }
    }

    logger.ready(
      `DTS generated in ${getTimeCost(start)} ${color.gray(`(${name})`)}`,
    );
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
