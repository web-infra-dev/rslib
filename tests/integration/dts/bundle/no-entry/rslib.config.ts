import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      dts: {
        bundle: true,
      },
    }),
  ],
  source: {
    entry: {
      index: '../__fixtures__/src',
    },
    tsconfigPath: '../__fixtures__/tsconfig.json',
  },
});
