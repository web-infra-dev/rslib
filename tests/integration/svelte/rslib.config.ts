import { pluginLess } from '@rsbuild/plugin-less';
import { pluginSvelte } from '@rsbuild/plugin-svelte';
import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  plugins: [pluginLess(), pluginSvelte()],
  output: {
    target: 'web',
  },
  lib: [
    // bundleless, ESM
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: 'dist/bundleless',
      },
    }),
  ],
});
