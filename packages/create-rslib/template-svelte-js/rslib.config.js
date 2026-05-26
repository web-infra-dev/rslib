import { pluginSvelte } from '@rsbuild/plugin-svelte';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
    },
  ],
  output: {
    target: 'web',
  },
  plugins: [pluginSvelte()],
});
