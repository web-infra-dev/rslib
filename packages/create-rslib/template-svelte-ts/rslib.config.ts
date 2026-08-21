import { pluginSvelte } from '@rsbuild/plugin-svelte';
import { defineConfig } from '@rslib/core';
import { svelteDtsPlugin } from './scripts/rslib-plugin-svelte-dts';

export default defineConfig({
  bundle: false,
  output: {
    target: 'web',
  },
  plugins: [pluginSvelte(), svelteDtsPlugin()],
});
