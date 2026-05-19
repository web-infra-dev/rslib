import { pluginSvelte } from '@rsbuild/plugin-svelte';
import { defineConfig } from '@rslib/core';

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
  plugins: [pluginSvelte()],
});
