import { defineConfig } from '@rslib/core';
import { pluginVue } from '@rsbuild/plugin-vue';

export default defineConfig({
  plugins: [pluginVue()],
  lib: [
    {
      format: 'esm',
    },
  ],
  output: {
    target: 'web',
  },
});
