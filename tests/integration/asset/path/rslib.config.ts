import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

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
  output: {
    target: 'web',
  },
});
