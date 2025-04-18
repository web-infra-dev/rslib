import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      dts: {
        autoExtension: true,
        distPath: './dist/types',
        bundle: false,
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      dts: {
        autoExtension: true,
        distPath: './dist/types',
        bundle: false,
      },
    }),
  ],
  source: {
    entry: {
      index: ['../__fixtures__/src/**'],
    },
    tsconfigPath: '../__fixtures__/tsconfig.json',
  },
});
