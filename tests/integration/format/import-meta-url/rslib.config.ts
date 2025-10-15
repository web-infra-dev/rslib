import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: './dist/esm',
      },
    }),
  ],
  source: {
    entry: {
      index: './src/index.js',
    },
  },
});
