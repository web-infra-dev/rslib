import { pluginSvelte } from '@rsbuild/plugin-svelte';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  bundle: false,
  output: {
    target: 'web',
  },
  plugins: [pluginSvelte()],
});
