import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      dts: {
        isolated: true,
      },
      output: {
        distPath: './dist-types/esm',
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      dts: {
        isolated: true,
        autoExtension: true,
      },
      output: {
        distPath: './dist-types/cjs',
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
