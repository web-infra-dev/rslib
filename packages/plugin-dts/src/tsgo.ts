import { logger } from '@rsbuild/core';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { DtsGenerationBackend } from './backend';
import type { EmitDtsOptions } from './dts';
import {
  color,
  getTimeCost,
  processDtsFiles,
  rewriteDtsExtensions,
  type GetTsconfigTsconfigResultForBin,
} from './utils';

const logPrefixTsgo = color.dim('[tsgo]');
const TYPESCRIPT_PACKAGE_NAME = 'typescript';
const NATIVE_PREVIEW_PACKAGE_NAME = '@typescript/native-preview';

type BinDtsGenerationBackend = Extract<
  DtsGenerationBackend,
  'tsc-bin' | 'tsgo-bin'
>;

type EmitDtsBinOptions = EmitDtsOptions<GetTsconfigTsconfigResultForBin> & {
  dtsBackend: BinDtsGenerationBackend;
};

type DtsBinCommand = {
  command: string;
  args: string[];
  displayCommand: string;
};

const getRequire = (cwd: string): NodeJS.Require =>
  createRequire(path.join(cwd, 'package.json'));

const getDtsBinPath = async (
  cwd: string,
  packageName:
    | typeof TYPESCRIPT_PACKAGE_NAME
    | typeof NATIVE_PREVIEW_PACKAGE_NAME,
): Promise<string> => {
  let packageJsonPath: string;

  try {
    packageJsonPath = getRequire(cwd).resolve(`${packageName}/package.json`);
  } catch {
    if (packageName === NATIVE_PREVIEW_PACKAGE_NAME) {
      throw new Error(
        'Failed to resolve @typescript/native-preview. Install "typescript@rc" or "@typescript/native-preview" to use TypeScript Go.',
      );
    }

    throw new Error(
      'Failed to resolve typescript. Install "typescript@rc" to use TypeScript Go.',
    );
  }

  const libPath = path.resolve(
    path.dirname(packageJsonPath),
    './lib/getExePath.js',
  );

  // handle Windows paths
  // On Windows, absolute paths must be valid file:// URLs
  let fileUrl: string;
  if (process.platform === 'win32') {
    fileUrl = pathToFileURL(libPath).href;
  } else {
    fileUrl = libPath;
  }

  return import(fileUrl).then((mod) => {
    const getExePath = mod.default;
    return getExePath();
  });
};

const resolveDtsBinCommand = async (
  dtsBackend: BinDtsGenerationBackend,
  args: string[],
  cwd: string,
): Promise<DtsBinCommand> => {
  const dtsBinFile = await getDtsBinPath(
    cwd,
    dtsBackend === 'tsc-bin'
      ? TYPESCRIPT_PACKAGE_NAME
      : NATIVE_PREVIEW_PACKAGE_NAME,
  );

  return {
    command: dtsBinFile,
    args,
    displayCommand: `${dtsBinFile} ${args.join(' ')}`,
  };
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
    // TODO: Enable watch mode when tsgo's watch support is ready.
    // Currently, watch mode is proof-of-concept only.
    // args.push('--watch');
  }

  return args;
};

async function handleDiagnosticsAndProcessFiles(
  isWatch: boolean,
  hasErrors: boolean,
  tsConfigResult: GetTsconfigTsconfigResultForBin,
  configPath: string,
  bundle: boolean,
  cwd: string,
  declarationDir: string,
  dtsExtension: string,
  redirect: EmitDtsOptions<GetTsconfigTsconfigResultForBin>['redirect'],
  rootDir: string,
  paths: EmitDtsOptions<GetTsconfigTsconfigResultForBin>['paths'],
  banner?: string,
  footer?: string,
  name?: string,
): Promise<void> {
  await rewriteDtsExtensions(
    cwd,
    declarationDir,
    dtsExtension,
    bundle,
    tsConfigResult.options.declarationMap,
  );

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
    // do not log the stack trace, diagnostic messages are enough
    error.stack = '';
    throw error;
  }
}

export async function emitDtsTsgo(
  options: EmitDtsBinOptions,
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
    dtsBackend,
  } = options;

  const args = generateTsgoArgs(configPath, declarationDir, build, isWatch);
  const dtsBinCommand = await resolveDtsBinCommand(dtsBackend, args, cwd);

  logger.debug(logPrefixTsgo, `Running: ${dtsBinCommand.displayCommand}`);

  return new Promise((resolve, reject) => {
    const childProcess = spawn(
      dtsBinCommand.command,
      [
        ...dtsBinCommand.args,
        // Required parameter to enable colored stdout
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
          logger.log(color.reset(`${logPrefixTsgo} ${line}`));
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
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  });
}
