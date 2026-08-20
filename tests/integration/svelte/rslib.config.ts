import { pluginLess } from '@rsbuild/plugin-less';
import { pluginSvelte } from '@rsbuild/plugin-svelte';
import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  plugins: [pluginLess()],
  lib: [
    // bundleless, ESM
    generateBundleEsmConfig({
      plugins: [pluginSvelte()],
      bundle: false,
      output: {
        target: 'web',
        distPath: 'dist/bundleless',
      },
    }),
    // bundle, ESM
    generateBundleEsmConfig({
      plugins: [pluginSvelte()],
      output: {
        target: 'web',
        distPath: 'dist/bundle',
      },
    }),
  ],
});
