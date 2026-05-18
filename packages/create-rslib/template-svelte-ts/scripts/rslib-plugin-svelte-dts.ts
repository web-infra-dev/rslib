import { resolve } from 'node:path';
import process from 'node:process';
import type { RsbuildPlugin } from '@rslib/core';
import { emitDts } from 'svelte2tsx';

export interface SvelteDtsPluginOptions {
  declarationDir?: string;
  libRoot?: string;
  tsconfig?: string;
  svelteShimsPath?: string;
}

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
          svelteShimsPath = 'node_modules/svelte2tsx/svelte-shims-v4.d.ts',
        } = options;

        try {
          await emitDts({
            declarationDir: resolve(process.cwd(), declarationDir),
            svelteShimsPath: resolve(process.cwd(), svelteShimsPath),
            libRoot: resolve(process.cwd(), libRoot),
            tsconfig: resolve(process.cwd(), tsconfig),
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
