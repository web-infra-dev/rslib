import { generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/esm/bundle',
          image: 'assets/bundle',
        },
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/esm/bundleless',
          image: 'assets/bundleless',
        },
      },
    }),
  ],
  source: {
    entry: {
      index: './src/index.js',
    },
  },
});
