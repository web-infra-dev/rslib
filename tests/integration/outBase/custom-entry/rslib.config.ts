import path from 'node:path';
import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    // default
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
    // configured with relative outBase
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
    // configured with absolute outBase
    generateBundleEsmConfig({
      bundle: false,
      outBase: path.resolve(__dirname, 'src/utils'),
      source: {
        entry: {
          index: './src/utils/foo',
        },
      },
      output: {
        distPath: {
          root: './dist/esm2',
        },
      },
    }),
  ],
});
