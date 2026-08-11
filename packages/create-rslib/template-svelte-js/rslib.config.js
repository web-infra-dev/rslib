import { pluginSvelte } from '@rsbuild/plugin-svelte';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  output: {
    target: 'web',
  },
  plugins: [pluginSvelte()],
});
