import { defineConfig } from '@rslib/core';
import { pluginUnpluginVue } from 'rsbuild-plugin-unplugin-vue';

export default defineConfig({
  plugins: [pluginUnpluginVue()],
  lib: [
    {
      format: 'esm',
    },
  ],
  output: {
    target: 'web',
  },
});
