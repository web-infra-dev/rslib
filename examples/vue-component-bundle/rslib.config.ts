import { defineConfig } from '@rslib/core';
import { pluginUnpluginVue } from 'rsbuild-plugin-unplugin-vue';

export default defineConfig({
  plugins: [pluginUnpluginVue()],
  lib: [
    {
      format: 'esm',
      experiments: {
        advancedEsm: true,
      },
    },
  ],
  output: {
    target: 'web',
  },
});
