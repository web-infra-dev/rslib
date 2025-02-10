import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      dts: true,
      output: {
        distPath: {
          root: './dist/esm0',
        },
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      dts: true,
      outBase: './src',
      output: {
        distPath: {
          root: './dist/esm1',
        },
      },
    }),
  ],
});
