import {
  logger,
  type LogLevel,
  type RsbuildConfig,
  type RsbuildPlugin,
} from '@rsbuild/core';
import { type ChildProcess, fork } from 'node:child_process';
import { extname, join } from 'node:path';

import {
  type DtsGenerationBackend,
  readTypescriptVersion,
  resolveDtsGenerationBackend,
} from './backend';
import {
  createIsolatedDtsContext,
  type IsolatedDtsContext,
  processIsolatedDts,
} from './isolated';
import {
  cleanDtsFiles,
  cleanTsBuildInfoFile,
  clearTempDeclarationDir,
  color,
  type CompilerApiTsconfigResultForApi,
  getDtsEmitPath,
  type GetTsconfigTsconfigResultForExecutable,
  loadTsconfig,
  loadTsconfigResultForExecutable,
  loadTypescript,
  processSourceEntry,
  warnIfOutside,
} from './utils';

export type DtsRedirect = {
  path?: boolean;
  extension?: boolean;
};

export type ApiExtractorOptions = {
  bundledPackages?: string[];
};

export type PluginDtsOptions = {
  bundle?: boolean | ApiExtractorOptions;
  distPath?: string;
  build?: boolean;
  abortOnError?: boolean;
  dtsExtension?: string;
  alias?: Record<string, string>;
  isolated?: boolean;
  autoExternal?:
    | boolean
    | {
        dependencies?: boolean;
        optionalDependencies?: boolean;
        peerDependencies?: boolean;
        devDependencies?: boolean;
      };
  banner?: string;
  footer?: string;
  redirect?: DtsRedirect;
  tsgo?: boolean;
};

export type DtsEntry = {
  name: string;
  path: string;
};

export type DtsGenOptions = Omit<
  PluginDtsOptions,
  'bundle' | 'isolated' | 'tsgo'
> & {
  bundle: boolean;
  name: string;
  cwd: string;
  isWatch: boolean;
  dtsEntry: DtsEntry[];
  dtsEmitPath: string;
  build?: boolean;
  tsconfigPath: string;
  tsConfigResult:
    | CompilerApiTsconfigResultForApi
    | GetTsconfigTsconfigResultForExecutable;
  userExternals?: NonNullable<RsbuildConfig['output']>['externals'];
  apiExtractorOptions?: ApiExtractorOptions;
  loggerLevel: LogLevel;
  dtsBackend: DtsGenerationBackend;
};

interface TaskResult {
  status: 'success' | 'error';
  errorMessage?: string;
}

export const PLUGIN_DTS_NAME = 'rsbuild:dts';

// use ts compiler API to generate bundleless dts
// use ts compiler API and api-extractor to generate dts bundle
export const pluginDts: (options?: PluginDtsOptions) => RsbuildPlugin = (
  options = {},
) => ({
  name: PLUGIN_DTS_NAME,

  setup(api) {
    const loggerLevel = api.logger.level;
    logger.level = loggerLevel;

    let apiExtractorOptions = {};

    if (options.bundle && typeof options.bundle === 'object') {
      apiExtractorOptions = {
        ...options.bundle,
      };
    }

    const bundle = !!options.bundle;
    options.abortOnError = options.abortOnError ?? true;
    options.build = options.build ?? false;
    options.redirect = options.redirect ?? {};
    options.redirect.path = options.redirect.path ?? true;
    options.redirect.extension = options.redirect.extension ?? false;
    options.alias = options.alias ?? {};

    let dtsPromise: Promise<TaskResult> = Promise.resolve({
      status: 'success',
    });
    let promiseResult: TaskResult;
    let childProcesses: ChildProcess[] = [];
    const typescriptVersion = readTypescriptVersion(api.context.rootPath);
    const dtsBackend = resolveDtsGenerationBackend(options, typescriptVersion);
    const tsApi =
      dtsBackend === 'api-old'
        ? loadTypescript(api.context.rootPath)
        : undefined;
    let dtsGenOptions: DtsGenOptions | undefined;
    let isolatedDtsContext: IsolatedDtsContext | undefined;

    api.modifyEnvironmentConfig((config, { mergeEnvironmentConfig }) => {
      if (options.isolated !== true) {
        return;
      }

      return mergeEnvironmentConfig(config, {
        tools: {
          swc: {
            jsc: {
              experimental: {
                emitIsolatedDts: true,
              },
            },
          },
        },
      });
    });

    api.onBeforeEnvironmentCompile(
      async ({ isWatch, isFirstCompile, environment, bundlerConfig }) => {
        if (dtsBackend === 'api-old' && !isFirstCompile) {
          return;
        }

        const { config } = environment;

        // @microsoft/api-extractor only support single entry to bundle declaration files
        // see https://github.com/microsoft/rushstack/issues/1596#issuecomment-546790721
        // we support multiple entries by calling api-extractor multiple times
        const dtsEntry = processSourceEntry(bundle, config.source?.entry);

        const cwd = api.context.rootPath;
        const configuredTsconfigPath =
          config.source.tsconfigPath ?? 'tsconfig.json';
        let tsconfigPath: string | undefined;
        let tsConfigResult:
          | CompilerApiTsconfigResultForApi
          | GetTsconfigTsconfigResultForExecutable
          | undefined;

        if (tsApi) {
          tsconfigPath = tsApi.findConfigFile(
            cwd,
            tsApi.sys.fileExists.bind(tsApi.sys),
            configuredTsconfigPath,
          );
          if (tsconfigPath) {
            tsConfigResult = loadTsconfig(tsconfigPath, tsApi);
          }
        } else {
          const loadedTsconfig = loadTsconfigResultForExecutable(
            cwd,
            configuredTsconfigPath,
          );
          tsconfigPath = loadedTsconfig?.path;
          tsConfigResult = loadedTsconfig?.config;
        }

        if (!tsconfigPath || !tsConfigResult) {
          const error = new Error(
            `Failed to resolve tsconfig file ${color.cyan(`"${configuredTsconfigPath}"`)} from ${color.cyan(cwd)}. Please ensure that the file exists.`,
          );
          error.stack = '';
          // do not log the stack trace, it is not helpful for users
          throw error;
        }

        const { options: rawCompilerOptions } = tsConfigResult;
        const { declarationDir, outDir, composite, incremental } =
          rawCompilerOptions;
        const distPathRoot =
          typeof config.output?.distPath === 'string'
            ? config.output?.distPath
            : config.output?.distPath.root;

        const dtsEmitPath = getDtsEmitPath(
          options.distPath,
          declarationDir,
          distPathRoot,
        );

        // check whether declarationDir or outDir is outside from current project
        warnIfOutside(cwd, declarationDir, 'declarationDir');
        warnIfOutside(cwd, outDir, 'outDir');

        // clean dts files and maps
        if (config.output.cleanDistPath !== false) {
          await cleanDtsFiles(cwd, dtsEmitPath);
        }

        // clean .rslib temp folder
        if (bundle) {
          await clearTempDeclarationDir(cwd);
        }

        // clean tsbuildinfo file
        if (
          dtsBackend !== 'isolated' &&
          (composite || incremental || options.build)
        ) {
          await cleanTsBuildInfoFile(tsconfigPath, rawCompilerOptions);
        }

        const {
          bundle: _bundle,
          isolated: _isolated,
          tsgo: _tsgo,
          ...rest
        } = options;

        dtsGenOptions = {
          ...rest,
          bundle,
          dtsEntry,
          dtsEmitPath,
          userExternals: config.output.externals,
          apiExtractorOptions,
          tsconfigPath,
          tsConfigResult,
          name: environment.name,
          cwd,
          isWatch,
          loggerLevel: loggerLevel as LogLevel,
          dtsBackend,
        };

        if (dtsBackend === 'isolated') {
          isolatedDtsContext = await createIsolatedDtsContext(
            dtsGenOptions,
            bundlerConfig,
          );
          dtsPromise = Promise.resolve({
            status: 'success',
          });
          return;
        }

        const jsExtension = extname(import.meta.filename);
        const childProcess = fork(
          join(import.meta.dirname, `./dts${jsExtension}`),
          [],
          {
            stdio: 'inherit',
          },
        );

        childProcesses.push(childProcess);
        childProcess.send(dtsGenOptions);

        dtsPromise = new Promise<TaskResult>((resolve) => {
          childProcess.on('message', (message) => {
            if (message === 'success') {
              resolve({
                status: 'success',
              });
            } else if (message === 'error') {
              resolve({
                status: 'error',
                errorMessage: `Error occurred in ${environment.name} declaration files generation.`,
              });
            }
          });
        });
      },
    );

    api.onAfterBuild({
      handler: async ({ isFirstCompile, stats }) => {
        if (dtsBackend === 'api-old' && !isFirstCompile) {
          return;
        }

        if (isolatedDtsContext) {
          try {
            await processIsolatedDts(isolatedDtsContext, {
              logSuccess: !stats?.hasErrors(),
            });
            // Isolated declaration diagnostics are reported by Rspack as
            // compilation errors. This only tracks plugin-dts post-processing.
            promiseResult = {
              status: 'success',
            };
          } catch (error) {
            logger.error(error);
            promiseResult = {
              status: 'error',
              errorMessage: `Error occurred in ${isolatedDtsContext.name} declaration files generation.`,
            };
          }
          return;
        }

        promiseResult = await dtsPromise;
      },
      // Set the order to 'pre' to ensure that when declaration files of multiple formats are generated simultaneously,
      // all errors are thrown together before exiting the process.
      order: 'pre',
    });

    api.onAfterBuild(({ isFirstCompile }) => {
      if (dtsBackend === 'api-old' && !isFirstCompile) {
        return;
      }

      if (promiseResult.status === 'error') {
        if (options.abortOnError) {
          const error = new Error(promiseResult.errorMessage);
          // do not log the stack trace, it is not helpful for users
          error.stack = '';
          throw error;
        }
        if (promiseResult.errorMessage) {
          logger.error(promiseResult.errorMessage);
        }
        logger.warn(
          'With `abortOnError` configuration currently disabled, type errors will not fail the build, but proper type declaration output cannot be guaranteed.',
        );
      }
    });

    const killProcesses = () => {
      for (const childProcess of childProcesses) {
        if (!childProcess.killed) {
          try {
            childProcess.kill();
            // mute kill error, such as: kill EPERM error on windows
            // https://github.com/nodejs/node/issues/51766
          } catch {
            // do nothing
          }
        }
      }
      childProcesses = [];
    };

    api.onCloseBuild(killProcesses);
    api.onCloseDevServer(killProcesses);
  },
});
