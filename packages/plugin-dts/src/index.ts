import { fork } from 'node:child_process';
import { extname, join } from 'node:path';
import type { RsbuildPlugin } from '@rsbuild/core';

export type pluginDtsOptions = {
  bundle?: boolean;
  distPath?: string;
  tsconfigPath?: string;
  entryPath?: string;
};

export type DtsGenOptions = {
  options: pluginDtsOptions;
  cwd: string;
  isWatch: boolean;
};

export const PLUGIN_DTS_NAME = 'rsbuild:dts';

// use ts compiler API to generate bundleless dts
// use ts compiler API and api-extractor to generate dts bundle
// TODO: support incremental build, to build one or more projects and their dependencies
// TODO: support autoExtension for dts files
// TODO: deal alias in dts
export const pluginDts = (options: pluginDtsOptions): RsbuildPlugin => ({
  name: PLUGIN_DTS_NAME,

  setup(api) {
    const config = api.getRsbuildConfig();

    options.bundle = options.bundle ?? false;
    options.distPath =
      options.distPath ?? config.output?.distPath?.root ?? 'dist';

    const dtsPromises: Promise<void>[] = [];

    api.onBeforeBuild(({ isWatch }) => {
      const jsExtension = extname(__filename);
      const childProcess = fork(join(__dirname, `./dts${jsExtension}`), [], {
        stdio: 'inherit',
      });

      const dtsGenOptions = {
        options,
        cwd: api.context.rootPath,
        isWatch,
      };

      childProcess.send(dtsGenOptions);

      dtsPromises.push(
        new Promise((resolve, reject) => {
          childProcess.on('message', (message) => {
            if (message === 'success') {
              resolve();
            } else if (message === 'error') {
              reject(new Error('Error occurred in dts generation'));
            }
          });
        }),
      );
    });

    api.onAfterBuild(async () => {
      await Promise.all(dtsPromises);
    });
  },
});
