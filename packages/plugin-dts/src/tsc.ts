import { logger } from '@rsbuild/core';
import color from 'picocolors';
import * as ts from 'typescript';
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
};

export async function emitDts(
  options: EmitDtsOptions,
  onComplete: (isSuccess: boolean) => void,
  bundle = false,
  isWatch = false,
): Promise<void> {
  const start = Date.now();
  const { configPath, declarationDir, name, dtsExtension } = options;
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
      const message = `${fileLoc} - ${color.red('error')} ${color.gray(`TS${diagnostic.code}:`)} ${ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        host.getNewLine(),
      )}`;
      diagnosticMessages.push(message);
    }

    await processDtsFiles(bundle, declarationDir, dtsExtension);

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
      `DTS generation succeeded in ${getTimeCost(start)} ${color.gray(`(${name})`)}`,
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
        if (errorCount === 0) {
          logger.info(message);
          onComplete(true);
        } else {
          logger.error(message);
        }
        await processDtsFiles(bundle, declarationDir, dtsExtension);
      }

      // 6193: 1 error
      if (diagnostic.code === 6193) {
        logger.error(message);
        await processDtsFiles(bundle, declarationDir, dtsExtension);
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
