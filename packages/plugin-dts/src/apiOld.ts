import { logger } from '@rsbuild/core';
import type {
  CompilerHost,
  CompilerOptions,
  Diagnostic,
  FormatDiagnosticsHost,
  Program,
  System,
  WatchStatusReporter,
} from 'typescript6-api';
import type { EmitDtsOptions } from './dts';
import type { OldApiTsconfigResult } from './types/internal';
import {
  color,
  getTimeCost,
  loadTypescript,
  processDtsFiles,
  renameDtsFile,
  updateDeclarationMapContent,
} from './utils';

const logPrefixTsc = color.dim('[tsc]');
/*
 * TS builds this prefix in `formatDiagnosticsWithColorAndContext`:
 * `diagnosticCategoryName` + `getCategoryFormat` + `formatColorAndReset`.
 * Rslib already prints `logger.error`, so strip only the TS category word.
 * Use String.fromCharCode(27) for ESC to avoid no-control-regex.
 * See https://github.com/microsoft/TypeScript/blob/main/src/compiler/program.ts
 */
const ansiEscape = String.fromCharCode(27);
let diagnosticErrorPrefixRE: RegExp | undefined;
const diagnosticCodeReplacement = `${ansiEscape}[90m$1${ansiEscape}[0m`;

const getDiagnosticErrorPrefixRE = (): RegExp =>
  (diagnosticErrorPrefixRE ??= new RegExp(
    `${ansiEscape}\\[91merror${ansiEscape}\\[0m${ansiEscape}\\[90m (TS\\d+: )${ansiEscape}\\[0m`,
  ));

const createFormatHost = (
  ts: ReturnType<typeof loadTypescript>,
): FormatDiagnosticsHost => ({
  getCanonicalFileName: (path) => path,
  getCurrentDirectory: ts.sys.getCurrentDirectory.bind(ts.sys),
  getNewLine: () => ts.sys.newLine,
});

const formatDiagnosticWithoutErrorWord = (
  ts: ReturnType<typeof loadTypescript>,
  formatHost: FormatDiagnosticsHost,
  diagnostic: Diagnostic,
): string =>
  ts
    .formatDiagnosticsWithColorAndContext([diagnostic], formatHost)
    .replace(getDiagnosticErrorPrefixRE(), diagnosticCodeReplacement);

async function handleDiagnosticsAndProcessFiles(
  ts: ReturnType<typeof loadTypescript>,
  formatHost: FormatDiagnosticsHost,
  diagnostics: readonly Diagnostic[],
  configPath: string,
  bundle: boolean,
  cwd: string,
  declarationDir: string,
  dtsExtension: string,
  redirect: EmitDtsOptions<OldApiTsconfigResult>['redirect'],
  rootDir: string,
  paths: Record<string, string[]>,
  banner?: string,
  footer?: string,
  name?: string,
): Promise<void> {
  const diagnosticMessages: string[] = [];

  for (const diagnostic of diagnostics) {
    const message = formatDiagnosticWithoutErrorWord(
      ts,
      formatHost,
      diagnostic,
    );
    diagnosticMessages.push(message);
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

export async function emitDtsWithOldApi(
  options: EmitDtsOptions<OldApiTsconfigResult>,
  onComplete: (isSuccess: boolean) => void | Promise<void>,
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
    cwd,
    banner,
    footer,
    paths,
    redirect,
    typescriptPath,
  } = options;
  const ts = loadTypescript(cwd, typescriptPath);
  const formatHost = createFormatHost(ts);
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
      formatDiagnosticWithoutErrorWord(ts, formatHost, diagnostic),
    );
  };

  let resolveFirstBuild!: () => void;
  let rejectFirstBuild!: (error: unknown) => void;
  const firstBuild = isWatch
    ? new Promise<void>((resolve, reject) => {
        resolveFirstBuild = resolve;
        rejectFirstBuild = reject;
      })
    : undefined;
  let watchTask = Promise.resolve();

  const reportWatchStatusChanged: WatchStatusReporter = (
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

    // TypeScript does not await status reporters. Track post-processing ourselves
    // so the initial IPC success is sent after the final declarations are ready.
    if (diagnostic.code === 6194 || diagnostic.code === 6193) {
      const success = diagnostic.code === 6194 && !errorCount;
      watchTask = watchTask
        .then(async () => {
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
          await onComplete(success);
          if (!success) {
            throw new Error(message);
          }
          logger.info(logPrefixTsc, message);
          resolveFirstBuild();
        })
        .catch((error: unknown) => {
          rejectFirstBuild(error);
          logger.error(error);
        });
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
        ts,
        formatHost,
        sortAndDeduplicateDiagnostics,
        configPath,
        bundle,
        cwd,
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
        ts,
        formatHost,
        sortAndDeduplicateDiagnostics,
        configPath,
        bundle,
        cwd,
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

    await firstBuild;
  }
}
