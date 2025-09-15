import { logger } from '@rsbuild/core';
import color from 'picocolors';
import type {
  CompilerHost,
  CompilerOptions,
  Diagnostic,
  FormatDiagnosticsHost,
  ParsedCommandLine,
  Program,
  System,
  WatchStatusReporter,
} from 'typescript';
import type { DtsRedirect } from './index';
import {
  getTimeCost,
  processDtsFiles,
  renameDtsFile,
  ts,
  updateDeclarationMapContent,
} from './utils';

const logPrefixTsc = color.dim('[tsc]');

const formatHost: FormatDiagnosticsHost = {
  getCanonicalFileName: (path) => path,
  getCurrentDirectory: ts.sys.getCurrentDirectory.bind(ts.sys),
  getNewLine: () => ts.sys.newLine,
};

export type EmitDtsOptions = {
  name: string;
  cwd: string;
  configPath: string;
  tsConfigResult: ParsedCommandLine;
  declarationDir: string;
  dtsExtension: string;
  rootDir: string;
  redirect: DtsRedirect;
  paths: Record<string, string[]>;
  banner?: string;
  footer?: string;
};

async function handleDiagnosticsAndProcessFiles(
  diagnostics: readonly Diagnostic[],
  configPath: string,
  bundle: boolean,
  declarationDir: string,
  dtsExtension: string,
  redirect: DtsRedirect,
  rootDir: string,
  paths: Record<string, string[]>,
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
    paths,
    banner,
    footer,
  );

  if (diagnosticMessages.length) {
    for (const message of diagnosticMessages) {
      logger.error(logPrefixTsc, message);
    }

    const error = new Error(
      `Failed to generate declaration files. ${color.dim(`(${name})`)}`,
    );
    // do not log the stack trace, diagnostic messages are enough
    error.stack = '';
    throw error;
  }
}

export async function emitDtsTsc(
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
    paths,
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

  const reportDiagnostic = (diagnostic: Diagnostic) => {
    logger.error(
      logPrefixTsc,
      ts.formatDiagnosticsWithColorAndContext([diagnostic], formatHost),
    );
  };

  const reportWatchStatusChanged: WatchStatusReporter = async (
    diagnostic: Diagnostic,
    _newLine: string,
    _options: CompilerOptions,
    errorCount?: number,
  ) => {
    const message = `${ts.flattenDiagnosticMessageText(
      diagnostic.messageText,
      formatHost.getNewLine(),
    )} ${color.dim(`(${name})`)}`;

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
        paths,
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
        paths,
        banner,
        footer,
      );
    }
  };

  const system: System = {
    ...ts.sys,
    writeFile: (fileName, contents, writeByteOrderMark) => {
      const newFileName = renameDtsFile(fileName, dtsExtension, bundle);
      const newContents = updateDeclarationMapContent(
        fileName,
        contents,
        dtsExtension,
        bundle,
        compilerOptions.declarationMap,
      );
      ts.sys.writeFile(newFileName, newContents, writeByteOrderMark);
    },
  };

  // build mode
  if (!isWatch) {
    // normal build - npx tsc
    if (!build && !compilerOptions.composite) {
      const originHost: CompilerHost = ts.createCompilerHost(compilerOptions);
      const host: CompilerHost = {
        ...originHost,
        writeFile: (
          fileName,
          contents,
          writeByteOrderMark,
          onError,
          sourceFiles,
        ) => {
          const newFileName = renameDtsFile(fileName, dtsExtension, bundle);
          const newContents = updateDeclarationMapContent(
            fileName,
            contents,
            dtsExtension,
            bundle,
            compilerOptions.declarationMap,
          );
          originHost.writeFile(
            newFileName,
            newContents,
            writeByteOrderMark,
            onError,
            sourceFiles,
          );
        },
      };

      const program: Program = ts.createProgram({
        rootNames: fileNames,
        options: compilerOptions,
        projectReferences,
        host,
        configFileParsingDiagnostics:
          ts.getConfigFileParsingDiagnostics(tsConfigResult),
      });

      const preEmitDiagnostics = ts.getPreEmitDiagnostics(program);
      const emitResult = program.emit();
      const allDiagnostics = preEmitDiagnostics.concat(emitResult.diagnostics);
      const sortAndDeduplicateDiagnostics =
        ts.sortAndDeduplicateDiagnostics(allDiagnostics);

      await handleDiagnosticsAndProcessFiles(
        sortAndDeduplicateDiagnostics,
        configPath,
        bundle,
        declarationDir,
        dtsExtension,
        redirect,
        rootDir,
        paths,
        banner,
        footer,
        name,
      );
    } else if (!build && compilerOptions.composite) {
      // incremental build with composite true - npx tsc
      const originHost: CompilerHost =
        ts.createIncrementalCompilerHost(compilerOptions);
      const host: CompilerHost = {
        ...originHost,
        writeFile: (
          fileName,
          contents,
          writeByteOrderMark,
          onError,
          sourceFiles,
        ) => {
          const newFileName = renameDtsFile(fileName, dtsExtension, bundle);
          const newContents = updateDeclarationMapContent(
            fileName,
            contents,
            dtsExtension,
            bundle,
            compilerOptions.declarationMap,
          );
          originHost.writeFile(
            newFileName,
            newContents,
            writeByteOrderMark,
            onError,
            sourceFiles,
          );
        },
      };

      const program = ts.createIncrementalProgram({
        rootNames: fileNames,
        options: compilerOptions,
        configFileParsingDiagnostics:
          ts.getConfigFileParsingDiagnostics(tsConfigResult),
        projectReferences,
        host,
        createProgram,
      });

      const allDiagnostics: Diagnostic[] = [];
      allDiagnostics.push(
        ...program.getConfigFileParsingDiagnostics(),
        ...program.getSyntacticDiagnostics(),
        ...program.getOptionsDiagnostics(),
        ...program.getGlobalDiagnostics(),
        ...program.getSemanticDiagnostics(),
        ...program.getDeclarationDiagnostics(),
      );

      const emitResult = program.emit();
      allDiagnostics.push(...emitResult.diagnostics);

      const sortAndDeduplicateDiagnostics =
        ts.sortAndDeduplicateDiagnostics(allDiagnostics);

      await handleDiagnosticsAndProcessFiles(
        sortAndDeduplicateDiagnostics,
        configPath,
        bundle,
        declarationDir,
        dtsExtension,
        redirect,
        rootDir,
        paths,
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
        paths,
        banner,
        footer,
      );

      if (errorNumber > 0) {
        const error = new Error(
          `Failed to generate declaration files. ${color.dim(`(${name})`)}`,
        );
        // do not log the stack trace, diagnostic messages are enough
        error.stack = '';
        throw error;
      }
    }

    if (bundle) {
      logger.info(
        `declaration files prepared in ${getTimeCost(start)} ${color.dim(`(${name})`)}`,
      );
    } else {
      logger.ready(
        `declaration files generated in ${getTimeCost(start)} ${color.dim(`(${name})`)}`,
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
