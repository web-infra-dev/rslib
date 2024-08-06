import { logger } from '@rsbuild/core';
import color from 'picocolors';
import * as ts from 'typescript';
import { getFileLoc, loadTsconfig } from './utils';

export type emitDtsOptions = {
  name: string;
  cwd: string;
  configPath: string;
  rootDir: string;
  declarationDir: string;
};

export function emitDts(
  options: emitDtsOptions,
  onComplete: (isSuccess: boolean) => void,
  isWatch = false,
): void {
  const start = Date.now();
  const getTimeCost = () => {
    return `${Math.floor(Date.now() - start)}ms`;
  };
  const { configPath, declarationDir, name } = options;
  const { options: rawCompilerOptions, fileNames } = loadTsconfig(configPath);

  const compilerOptions = {
    ...rawCompilerOptions,
    noEmit: false,
    declaration: true,
    declarationDir,
    emitDeclarationOnly: true,
  };

  if (!isWatch) {
    const host: ts.CompilerHost = ts.createCompilerHost(compilerOptions);

    const program: ts.Program = ts.createProgram(
      fileNames,
      compilerOptions,
      host,
    );

    const emitResult = program.emit();

    const allDiagnostics = ts
      .getPreEmitDiagnostics(program)
      .concat(emitResult.diagnostics);

    const diagnosticMessages: string[] = [];

    for (const diagnostic of allDiagnostics) {
      const fileLoc = getFileLoc(diagnostic);
      const message = `${fileLoc} error TS${diagnostic.code}: ${ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        host.getNewLine(),
      )}`;
      diagnosticMessages.push(message);
    }

    if (diagnosticMessages.length) {
      logger.error(
        `Failed to emit declaration files. ${color.gray(`(${name})`)}`,
      );

      for (const message of diagnosticMessages) {
        logger.error(message);
      }

      throw new Error('DTS generation failed');
    }

    logger.info(
      `DTS generation succeeded in ${getTimeCost()} ${color.gray(`(${name})`)}`,
    );
  } else {
    const createProgram = ts.createSemanticDiagnosticsBuilderProgram;
    const formatHost: ts.FormatDiagnosticsHost = {
      getCanonicalFileName: (path) => path,
      getCurrentDirectory: ts.sys.getCurrentDirectory,
      getNewLine: () => ts.sys.newLine,
    };

    const reportDiagnostic = (diagnostic: ts.Diagnostic) => {
      const fileLoc = getFileLoc(diagnostic);

      logger.error(
        `${fileLoc} error TS${diagnostic.code}:`,
        ts.flattenDiagnosticMessageText(
          diagnostic.messageText,
          formatHost.getNewLine(),
        ),
      );
    };

    const reportWatchStatusChanged: ts.WatchStatusReporter = (
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
        if (errorCount === 0) {
          logger.info(message);
          onComplete(true);
        } else {
          logger.error(message);
        }
      }

      // 6193: 1 error
      if (diagnostic.code === 6193) {
        logger.error(message);
      }
    };

    const system = { ...ts.sys };

    const host = ts.createWatchCompilerHost(
      configPath,
      compilerOptions,
      system,
      createProgram,
      reportDiagnostic,
      reportWatchStatusChanged,
    );

    ts.createWatchProgram(host);
  }
}
