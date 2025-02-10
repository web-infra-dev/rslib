import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      source: {
        entry: {
          index: './src/utils/foo',
        },
      },
      output: {
        distPath: {
          root: './dist/esm0',
        },
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      outBase: './src/utils',
      source: {
        entry: {
          index: './src/utils/foo',
        },
      },
      output: {
        distPath: {
          root: './dist/esm1',
        },
      },
    }),
  ],
});
