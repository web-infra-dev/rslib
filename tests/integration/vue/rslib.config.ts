import { pluginLess } from '@rsbuild/plugin-less';
import { defineConfig } from '@rslib/core';
import { pluginUnpluginVue } from 'rsbuild-plugin-unplugin-vue';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  plugins: [pluginLess()],
  lib: [
    // bundleless, ESM
    generateBundleEsmConfig({
      plugins: [pluginUnpluginVue()],
      bundle: false,
      output: {
        target: 'web',
        distPath: 'dist/bundleless',
      },
    }),
    // bundle, ESM
    generateBundleEsmConfig({
      plugins: [pluginUnpluginVue()],
      output: {
        target: 'web',
        distPath: 'dist/bundle',
      },
    }),
  ],
});
