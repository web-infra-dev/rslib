import { fork } from 'node:child_process';
import { extname, join } from 'node:path';
import { type RsbuildPlugin, logger } from '@rsbuild/core';
import { processSourceEntry } from './utils';

export type PluginDtsOptions = {
  bundle?: boolean;
  distPath?: string;
  abortOnError?: boolean;
  dtsExtension?: string;
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
  tsconfigPath?: string;
};

interface TaskResult {
  status: 'success' | 'error';
  errorMessage?: string;
}

export const PLUGIN_DTS_NAME = 'rsbuild:dts';

// use ts compiler API to generate bundleless dts
// use ts compiler API and api-extractor to generate dts bundle
// TODO: support incremental build, to build one or more projects and their dependencies
// TODO: support autoExtension for dts files
// TODO: deal alias in dts
export const pluginDts = (options: PluginDtsOptions): RsbuildPlugin => ({
  name: PLUGIN_DTS_NAME,

  setup(api) {
    options.bundle = options.bundle ?? false;
    options.abortOnError = options.abortOnError ?? true;

    const dtsPromises: Promise<TaskResult>[] = [];
    let promisesResult: TaskResult[] = [];

    api.onBeforeEnvironmentCompile(
      ({ isWatch, isFirstCompile, environment }) => {
        if (!isFirstCompile) {
          return;
        }

        const { config } = environment;

        options.distPath = options.distPath ?? config.output?.distPath?.root;

        const jsExtension = extname(__filename);
        const childProcess = fork(join(__dirname, `./dts${jsExtension}`), [], {
          stdio: 'inherit',
        });

        // TODO: @microsoft/api-extractor only support single entry to bundle DTS
        // use first element of Record<string, string> type entry config
        const dtsEntry = processSourceEntry(
          options.bundle!,
          config.source?.entry,
        );

        const dtsGenOptions: DtsGenOptions = {
          ...options,
          dtsEntry,
          tsconfigPath: config.source.tsconfigPath,
          name: environment.name,
          cwd: api.context.rootPath,
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
  },
});
