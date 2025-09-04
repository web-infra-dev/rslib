import { type ChildProcess, fork } from 'node:child_process';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger, type RsbuildConfig, type RsbuildPlugin } from '@rsbuild/core';
import color from 'picocolors';
import ts from 'typescript';
import {
  cleanDtsFiles,
  cleanTsBuildInfoFile,
  clearTempDeclarationDir,
  getDtsEmitPath,
  loadTsconfig,
  processSourceEntry,
  warnIfOutside,
} from './utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  experiments?: {
    tsgo?: boolean;
  };
};

export type DtsEntry = {
  name: string;
  path: string;
};

export type DtsGenOptions = Omit<PluginDtsOptions, 'bundle'> & {
  bundle: boolean;
  name: string;
  cwd: string;
  isWatch: boolean;
  dtsEntry: DtsEntry[];
  dtsEmitPath: string;
  build?: boolean;
  tsconfigPath: string;
  tsConfigResult: ts.ParsedCommandLine;
  userExternals?: NonNullable<RsbuildConfig['output']>['externals'];
  apiExtractorOptions?: ApiExtractorOptions;
};

interface TaskResult {
  status: 'success' | 'error';
  errorMessage?: string;
}

export const PLUGIN_DTS_NAME = 'rsbuild:dts';

// use ts compiler API to generate bundleless dts
// use ts compiler API and api-extractor to generate dts bundle
export const pluginDts = (options: PluginDtsOptions = {}): RsbuildPlugin => ({
  name: PLUGIN_DTS_NAME,

  setup(api) {
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
    options.experiments = options.experiments ?? {};
    options.experiments.tsgo = options.experiments.tsgo ?? false;

    const dtsPromises: Promise<TaskResult>[] = [];
    let promisesResult: TaskResult[] = [];
    let childProcesses: ChildProcess[] = [];

    api.onBeforeEnvironmentCompile(
      async ({ isWatch, isFirstCompile, environment }) => {
        if (!isFirstCompile && !options.experiments?.tsgo) {
          return;
        }

        const { config } = environment;

        // @microsoft/api-extractor only support single entry to bundle declaration files
        // see https://github.com/microsoft/rushstack/issues/1596#issuecomment-546790721
        // we support multiple entries by calling api-extractor multiple times
        const dtsEntry = processSourceEntry(bundle, config.source?.entry);

        const cwd = api.context.rootPath;
        const tsconfigPath = ts.findConfigFile(
          cwd,
          ts.sys.fileExists.bind(ts.sys),
          config.source.tsconfigPath,
        );

        if (!tsconfigPath) {
          const error = new Error(
            `Failed to resolve tsconfig file ${color.cyan(`"${config.source.tsconfigPath}"`)} from ${color.cyan(cwd)}. Please ensure that the file exists.`,
          );
          error.stack = '';
          // do not log the stack trace, it is not helpful for users
          throw error;
        }

        const tsConfigResult = loadTsconfig(tsconfigPath);
        const { options: rawCompilerOptions } = tsConfigResult;
        const { declarationDir, outDir, composite, incremental } =
          rawCompilerOptions;
        const dtsEmitPath = getDtsEmitPath(
          options.distPath,
          declarationDir,
          config.output?.distPath?.root,
        );

        // check whether declarationDir or outDir is outside from current project
        warnIfOutside(cwd, declarationDir, 'declarationDir');
        warnIfOutside(cwd, outDir, 'outDir');

        // clean dts files
        if (config.output.cleanDistPath !== false) {
          await cleanDtsFiles(dtsEmitPath);
        }

        // clean .rslib temp folder
        if (bundle) {
          await clearTempDeclarationDir(cwd);
        }

        // clean tsbuildinfo file
        if (composite || incremental || options.build) {
          await cleanTsBuildInfoFile(tsconfigPath, rawCompilerOptions);
        }

        const jsExtension = extname(__filename);
        const childProcess = fork(join(__dirname, `./dts${jsExtension}`), [], {
          stdio: 'inherit',
        });

        childProcesses.push(childProcess);

        const dtsGenOptions: DtsGenOptions = {
          ...options,
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
                  errorMessage: `Error occurred in ${environment.name} declaration files generation.`,
                });
              }
            });
          }),
        );
      },
    );

    api.onAfterBuild({
      handler: async ({ isFirstCompile }) => {
        if (!isFirstCompile) {
          return;
        }

        promisesResult = await Promise.all(dtsPromises);
      },
      // Set the order to 'pre' to ensure that when declaration files of multiple formats are generated simultaneously,
      // all errors are thrown together before exiting the process.
      order: 'pre',
    });

    api.onAfterBuild(({ isFirstCompile }) => {
      if (!isFirstCompile) {
        return;
      }

      for (const result of promisesResult) {
        if (result.status === 'error') {
          if (options.abortOnError) {
            const error = new Error(result.errorMessage);
            // do not log the stack trace, it is not helpful for users
            error.stack = '';
            throw error;
          }
          result.errorMessage && logger.error(result.errorMessage);
          logger.warn(
            'With `abortOnError` configuration currently disabled, type errors will not fail the build, but proper type declaration output cannot be guaranteed.',
          );
        }
      }
    });

    const killProcesses = () => {
      for (const childProcess of childProcesses) {
        if (!childProcess.killed) {
          try {
            childProcess.kill();
            // mute kill error, such as: kill EPERM error on windows
            // https://github.com/nodejs/node/issues/51766
          } catch (_err) {}
        }
      }
      childProcesses = [];
    };

    api.onCloseBuild(killProcesses);
    api.onCloseDevServer(killProcesses);
  },
});
