import { pluginLess } from '@rsbuild/plugin-less';
import { pluginVue } from '@rsbuild/plugin-vue';
import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  plugins: [pluginLess()],
  lib: [
    // bundleless, ESM
    generateBundleEsmConfig({
      plugins: [pluginVue()],
      bundle: false,
      output: {
        target: 'web',
        distPath: 'dist/bundleless',
      },
    }),
    // bundle, ESM
    generateBundleEsmConfig({
      plugins: [pluginVue()],
      output: {
        target: 'web',
        distPath: 'dist/bundle',
      },
    }),
  ],
});
