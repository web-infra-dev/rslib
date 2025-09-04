import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { logger } from '@rsbuild/core';
import color from 'picocolors';
import ts from 'typescript';
import type { DtsRedirect } from './index';
import type { EmitDtsOptions } from './tsc';
import {
  getTimeCost,
  globDtsFiles,
  processDtsFiles,
  renameDtsFile,
  updateDeclarationMapContent,
} from './utils';

const require = createRequire(import.meta.url);

const logPrefixTsgo = color.dim('[tsgo]');

const getTsgoBinPath = async (): Promise<string> => {
  const tsgoPkgPath = require.resolve(
    '@typescript/native-preview/package.json',
  );

  const libPath = path.resolve(
    path.dirname(tsgoPkgPath),
    './lib/getExePath.js',
  );

  return import(libPath).then((mod) => {
    const getExePath = mod.default;
    return getExePath();
  });
};

const generateTsgoArgs = (
  configPath: string,
  declarationDir: string,
  build: boolean,
  isWatch: boolean,
): string[] => {
  const args: string[] = [];

  if (build) {
    args.push('--build', configPath);
  } else {
    args.push('--project', configPath);
    args.push('--declarationDir', declarationDir);
  }

  args.push('--noEmit', 'false');
  args.push('--declaration');
  args.push('--emitDeclarationOnly');

  if (isWatch) {
    // rebuild when watch since watch mode is proof-of-concept only currently in tsgo
    // args.push('--watch');
  }

  return args;
};

async function handleDiagnosticsAndProcessFiles(
  isWatch: boolean,
  hasErrors: boolean,
  tsConfigResult: ts.ParsedCommandLine,
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
  if (!bundle) {
    const dtsFiles = await globDtsFiles(declarationDir, [
      '/**/*.d.ts',
      '/**/*.d.ts.map',
    ]);
    await Promise.all(
      dtsFiles.map(async (file) => {
        const contents = ts.sys.readFile(file) ?? '';
        const newFileName = renameDtsFile(file, dtsExtension, bundle);
        const newContents = updateDeclarationMapContent(
          file,
          contents,
          dtsExtension,
          bundle,
          tsConfigResult.options.declarationMap,
        );
        if (file !== newFileName || contents !== newContents) {
          ts.sys.writeFile(newFileName, newContents);
          if (ts.sys.deleteFile) {
            ts.sys.deleteFile(file);
          } else {
            fs.unlinkSync(file);
          }
        }
      }),
    );
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

  if (hasErrors && !isWatch) {
    const error = new Error(
      `Failed to generate declaration files. ${color.dim(`(${name})`)}`,
    );
    // do not log the stack trace, diagnostic messages are enough
    error.stack = '';
    throw error;
  }
}

export async function emitDtsTsgo(
  options: EmitDtsOptions,
  _onComplete: (isSuccess: boolean) => void,
  bundle = false,
  isWatch = false,
  build = false,
): Promise<boolean> {
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
    cwd,
  } = options;

  const tsgoBinFile = await getTsgoBinPath();
  const args = generateTsgoArgs(configPath, declarationDir, build, isWatch);

  logger.debug(logPrefixTsgo, `Running: ${tsgoBinFile} ${args.join(' ')}`);

  return new Promise((resolve, reject) => {
    const childProcess = spawn(
      tsgoBinFile,
      [
        ...args,
        /* Required parameter, use it stdout have color */
        '--pretty',
      ],
      {
        cwd,
        stdio: ['inherit', 'pipe', 'pipe'],
      },
    );

    let hasErrors = false;

    childProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.trim()) {
          // Reset color for each line to avoid color bleed
          console.log(color.reset(`${logPrefixTsgo} ${line}`));
        }
      }
    });

    childProcess.stderr?.on('data', (data) => {
      const output = data.toString();
      const lines = output.split('\n').filter((line: string) => line.trim());
      for (const line of lines) {
        logger.error(logPrefixTsgo, line);
      }
    });

    childProcess.on('close', async (code) => {
      try {
        if (code !== 0) {
          hasErrors = true;
        }

        await handleDiagnosticsAndProcessFiles(
          isWatch,
          hasErrors,
          tsConfigResult,
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

        if (!hasErrors) {
          if (bundle) {
            logger.info(
              `declaration files prepared with tsgo in ${getTimeCost(start)} ${color.dim(`(${name})`)}`,
            );
          } else {
            logger.ready(
              `declaration files generated with tsgo in ${getTimeCost(start)} ${color.dim(`(${name})`)}`,
            );
          }
        }

        resolve(hasErrors);
      } catch (error) {
        reject(error);
      }
    });
  });
}
