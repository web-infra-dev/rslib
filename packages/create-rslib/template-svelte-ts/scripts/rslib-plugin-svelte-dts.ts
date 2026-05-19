import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import type { RsbuildPlugin } from '@rslib/core';
import { emitDts } from 'svelte2tsx';

const require = createRequire(import.meta.url);

export interface SvelteDtsPluginOptions {
  declarationDir?: string;
  libRoot?: string;
  tsconfig?: string;
  svelteShimsPath?: string;
}

const resolveProjectPath = (rootPath: string, path: string): string =>
  resolve(rootPath, path);

export function svelteDtsPlugin(
  options: SvelteDtsPluginOptions = {},
): RsbuildPlugin {
  return {
    name: 'rslib-plugin-svelte-dts',
    setup(api) {
      api.onAfterBuild(async () => {
        const {
          declarationDir = './dist',
          libRoot = './src',
          tsconfig = 'tsconfig.json',
        } = options;

        const rootPath = api.context.rootPath;
        const svelteShimsPath =
          options.svelteShimsPath ?
            resolveProjectPath(rootPath, options.svelteShimsPath)
          : require.resolve('svelte2tsx/svelte-shims-v4.d.ts');

        try {
          await emitDts({
            declarationDir: resolveProjectPath(rootPath, declarationDir),
            svelteShimsPath,
            libRoot: resolveProjectPath(rootPath, libRoot),
            tsconfig: resolveProjectPath(rootPath, tsconfig),
          });

          console.log('Svelte DTS generation complete');
        } catch (error) {
          console.error('Svelte DTS generation failed:', error);
          throw error;
        }
      });
    },
  };
}
