import { pluginVue } from '@rsbuild/plugin-vue';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      output: {
        target: 'web',
      },
    },
  ],
  plugins: [pluginVue()],
});
