import { pluginSvelte } from '@rsbuild/plugin-svelte';
import { defineConfig } from '@rslib/core';
import { svelteDtsPlugin } from './scripts/rslib-plugin-svelte-dts';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      dts: false,
    },
  ],
  output: {
    target: 'web',
  },
  resolve: {
    conditionNames: ['svelte', 'browser', '...'],
  },
  plugins: [pluginSvelte(), svelteDtsPlugin()],
});
