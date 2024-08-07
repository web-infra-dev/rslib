import { fork } from 'node:child_process';
import { extname, join } from 'node:path';
import { type RsbuildPlugin, logger } from '@rsbuild/core';

export type PluginDtsOptions = {
  bundle?: boolean;
  distPath?: string;
  abortOnError?: boolean;
};

export type DtsGenOptions = PluginDtsOptions & {
  name: string;
  cwd: string;
  isWatch: boolean;
  entryPath?: string;
  tsconfigPath?: string;
};

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

    const dtsPromises: Promise<string>[] = [];
    let promisesResult: string[] = [];

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

        const dtsGenOptions: DtsGenOptions = {
          ...options,
          // TODO: temporarily use main as dts entry, only accept single entry
          entryPath: config.source?.entry?.main as string,
          tsconfigPath: config.source.tsconfigPath,
          name: environment.name,
          cwd: api.context.rootPath,
          isWatch,
        };

        childProcess.send(dtsGenOptions);

        dtsPromises.push(
          new Promise<string>((resolve) => {
            childProcess.on('message', (message) => {
              if (message === 'success') {
                resolve('Success');
              } else if (message === 'error') {
                resolve(`Error occurred in ${environment.name} DTS generation`);
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
          if (result.startsWith('Error')) {
            if (options.abortOnError) {
              throw new Error(result);
            }
            logger.error(result);
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
