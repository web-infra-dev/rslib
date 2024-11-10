import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/bundle/esm0',
        },
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      output: {
        minify: true,
        distPath: {
          root: './dist/bundle/esm1',
        },
      },
    }),
  ],
  source: {
    entry: {
      index: './src/*',
    },
  },
  output: {
    target: 'web',
  },
});
