import path from 'node:path';
import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    // default
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/esm0',
        },
      },
    }),
    // configured with relative outBase
    generateBundleEsmConfig({
      bundle: false,
      outBase: './src',
      output: {
        distPath: {
          root: './dist/esm1',
        },
      },
    }),
    // configured with absolute outBase
    generateBundleEsmConfig({
      bundle: false,
      outBase: path.resolve(__dirname, 'src'),
      output: {
        distPath: {
          root: './dist/esm2',
        },
      },
    }),
  ],
});
