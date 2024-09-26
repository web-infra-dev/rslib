import { generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/normal',
        },
      },
    }),
    generateBundleEsmConfig({
      syntax: 'esnext',
      output: {
        distPath: {
          root: './dist/with-syntax',
        },
      },
    }),
  ],
  output: {
    target: 'node',
  },
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
});
