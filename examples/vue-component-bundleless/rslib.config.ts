import { pluginVue } from '@rsbuild/plugin-vue';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  plugins: [pluginVue()],
  lib: [
    {
      format: 'esm',
      bundle: false,
    },
  ],
  output: {
    target: 'web',
  },
});
