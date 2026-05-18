import { pluginSvelte } from '@rsbuild/plugin-svelte';
import { defineConfig } from '@rslib/core';
import { svelteDtsPlugin } from './scripts/rslib-plugin-svelte-dts';

export default defineConfig({
  resolve: {
    conditionNames: ['svelte', 'browser', '...'],
  },
  lib: [
    {
      format: 'esm',
      dts: false,
    },
  ],
  output: {
    target: 'web',
  },
  plugins: [
    pluginSvelte(),
    svelteDtsPlugin({
      declarationDir: './dist',
      libRoot: './src',
      tsconfig: 'tsconfig.json',
    }),
  ],
});
