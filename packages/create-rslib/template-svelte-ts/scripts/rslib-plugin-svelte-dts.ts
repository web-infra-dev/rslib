import type { RsbuildPlugin } from '@rslib/core';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { emitDts, type EmitDtsConfig } from 'svelte2tsx';

type SvelteDtsPluginOptions = Partial<EmitDtsConfig>;

const resolveProjectPath = (rootPath: string, path: string): string =>
  resolve(rootPath, path);

export function svelteDtsPlugin(
  options: SvelteDtsPluginOptions = {},
): RsbuildPlugin {
  return {
    name: 'rslib-plugin-svelte-dts',
    setup(api) {
      api.onAfterBuild(async ({ isWatch }) => {
        if (!isWatch) {
          api.logger.start('generating declaration files...');
        }

        const {
          declarationDir = './dist',
          libRoot = './src',
          tsconfig,
        } = options;
        const rootPath = api.context.rootPath;
        const tsconfigPath = resolveProjectPath(
          rootPath,
          tsconfig ??
            api.getNormalizedConfig().source.tsconfigPath ??
            './tsconfig.json',
        );
        const svelteShimsPath = options.svelteShimsPath
          ? resolveProjectPath(rootPath, options.svelteShimsPath)
          : fileURLToPath(
              import.meta.resolve('svelte2tsx/svelte-shims-v4.d.ts'),
            );

        try {
          await emitDts({
            declarationDir: resolveProjectPath(rootPath, declarationDir),
            svelteShimsPath,
            libRoot: resolveProjectPath(rootPath, libRoot),
            tsconfig: tsconfigPath,
          });

          api.logger.ready(`declaration files generated with svelte2tsx.`);
        } catch (error) {
          api.logger.error(
            'Failed to generate declaration files with svelte2tsx.',
          );
          api.logger.error(error);
          throw error;
        }
      });
    },
  };
}
