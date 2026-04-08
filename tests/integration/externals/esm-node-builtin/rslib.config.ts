import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      id: 'esm-default',
      output: {
        distPath: './dist/esm-default',
      },
    }),
    generateBundleEsmConfig({
      id: 'esm-external-false',
      output: {
        distPath: './dist/esm-false',
        externals: {
          'node:os': false,
        },
      },
    }),
    generateBundleEsmConfig({
      id: 'esm-external-foo',
      output: {
        distPath: './dist/esm-foo',
        externals: {
          'node:path': 'foo',
        },
      },
    }),
  ],
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
});
