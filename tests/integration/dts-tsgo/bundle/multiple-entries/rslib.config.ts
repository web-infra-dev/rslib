import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      dts: {
        bundle: true,
        tsgo: true,
      },
    }),
    generateBundleCjsConfig({
      dts: {
        bundle: true,
        tsgo: true,
      },
    }),
  ],
  source: {
    entry: {
      index: '../__fixtures__/src/index.ts',
      sum: '../__fixtures__/src/sum.ts',
    },
    tsconfigPath: '../__fixtures__/tsconfig.json',
  },
});
