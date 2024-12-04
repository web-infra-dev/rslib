import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';
import pluginVue from 'unplugin-vue/rspack';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      source: {
        entry: {
          index: './src/index.vue',
        },
      },
      tools: {
        rspack: {
          plugins: [pluginVue()],
        },
      },
      output: {
        target: 'web',
      },
    }),
  ],
});
