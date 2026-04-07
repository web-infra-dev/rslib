import { defineConfig } from '@rslib/core';
import { pluginVue } from '@rsbuild/plugin-vue';

export default defineConfig({
  lib: [
    {
      bundle: false,
      format: 'esm',
    },
  ],
  output: {
    target: 'web',
  },
  plugins: [pluginVue()],
});
