import { type ChildProcess, fork } from 'node:child_process';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type RsbuildConfig, type RsbuildPlugin, logger } from '@rsbuild/core';
import ts from 'typescript';
import {
  cleanDtsFiles,
  cleanTsBuildInfoFile,
  clearTempDeclarationDir,
  loadTsconfig,
  processSourceEntry,
} from './utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type PluginDtsOptions = {
  bundle?: boolean;
  distPath?: string;
  build?: boolean;
  abortOnError?: boolean;
  dtsExtension?: string;
  autoExternal?:
    | boolean
    | {
        dependencies?: boolean;
        devDependencies?: boolean;
        peerDependencies?: boolean;
      };
  banner?: string;
  footer?: string;
};

export type DtsEntry = {
  name?: string;
  path?: string;
};

export type DtsGenOptions = PluginDtsOptions & {
  name: string;
  cwd: string;
  isWatch: boolean;
  dtsEntry: DtsEntry;
  dtsEmitPath: string;
  build?: boolean;
  tsconfigPath: string;
  tsConfigResult: ts.ParsedCommandLine;
  userExternals?: NonNullable<RsbuildConfig['output']>['externals'];
};

interface TaskResult {
  status: 'success' | 'error';
  errorMessage?: string;
}

export const PLUGIN_DTS_NAME = 'rsbuild:dts';

// use ts compiler API to generate bundleless dts
// use ts compiler API and api-extractor to generate dts bundle
// TODO: deal alias in dts
export const pluginDts = (options: PluginDtsOptions = {}): RsbuildPlugin => ({
  name: PLUGIN_DTS_NAME,

  setup(api) {
    options.bundle = options.bundle ?? false;
    options.abortOnError = options.abortOnError ?? true;
    options.build = options.build ?? false;

    const dtsPromises: Promise<TaskResult>[] = [];
    let promisesResult: TaskResult[] = [];
    let childProcesses: ChildProcess[] = [];

    api.onBeforeEnvironmentCompile(
      async ({ isWatch, isFirstCompile, environment }) => {
        if (!isFirstCompile) {
          return;
        }

        const { config } = environment;

        // TODO: @microsoft/api-extractor only support single entry to bundle DTS
        // use first element of Record<string, string> type entry config
        const dtsEntry = processSourceEntry(
          options.bundle!,
          config.source?.entry,
        );

        const cwd = api.context.rootPath;
        const tsconfigPath = ts.findConfigFile(
          cwd,
          ts.sys.fileExists,
          config.source.tsconfigPath,
        );

        if (!tsconfigPath) {
          logger.error(`tsconfig.json not found in ${cwd}`);
          throw new Error();
        }

        const tsConfigResult = loadTsconfig(tsconfigPath);
        const compilerOptions = tsConfigResult.options;
        const dtsEmitPath =
          options.distPath ??
          compilerOptions.declarationDir ??
          config.output?.distPath?.root;

        const jsExtension = extname(__filename);
        const childProcess = fork(join(__dirname, `./dts${jsExtension}`), [], {
          stdio: 'inherit',
        });

        childProcesses.push(childProcess);

        const { cleanDistPath } = config.output;

        // clean dts files
        if (cleanDistPath !== false) {
          await cleanDtsFiles(dtsEmitPath);
        }

        // clean .rslib temp folder
        if (options.bundle) {
          await clearTempDeclarationDir(cwd);
        }

        // clean tsbuildinfo file
        if (
          compilerOptions.composite ||
          compilerOptions.incremental ||
          options.build
        ) {
          await cleanTsBuildInfoFile(tsconfigPath, tsConfigResult);
        }

        const dtsGenOptions: DtsGenOptions = {
          ...options,
          dtsEntry,
          dtsEmitPath,
          userExternals: config.output.externals,
          tsconfigPath,
          tsConfigResult,
          name: environment.name,
          cwd,
          isWatch,
        };

        childProcess.send(dtsGenOptions);

        dtsPromises.push(
          new Promise<TaskResult>((resolve) => {
            childProcess.on('message', (message) => {
              if (message === 'success') {
                resolve({
                  status: 'success',
                });
              } else if (message === 'error') {
                resolve({
                  status: 'error',
                  errorMessage: `Error occurred in ${environment.name} DTS generation`,
                });
              }
            });
          }),
        );
      },
    );

    api.onAfterBuild(async ({ isFirstCompile }) => {
      if (!isFirstCompile) {
        return;
      }

      promisesResult = await Promise.all(dtsPromises);
    });

    api.onAfterBuild({
      handler: ({ isFirstCompile }) => {
        if (!isFirstCompile) {
          return;
        }

        for (const result of promisesResult) {
          if (result.status === 'error') {
            if (options.abortOnError) {
              throw new Error(result.errorMessage);
            }
            result.errorMessage && logger.error(result.errorMessage);
            logger.warn(
              'With the `abortOnError` configuration currently turned off, type errors do not cause build failures, but they do not guarantee proper type file output.',
            );
          }
        }
      },
      order: 'post',
    });

    const killProcesses = () => {
      for (const childProcess of childProcesses) {
        if (!childProcess.killed) {
          childProcess.kill();
        }
      }
      childProcesses = [];
    };

    api.onCloseBuild(killProcesses);
    api.onCloseDevServer(killProcesses);
  },
});
