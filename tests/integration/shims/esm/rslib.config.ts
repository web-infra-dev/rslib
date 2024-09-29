import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

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
