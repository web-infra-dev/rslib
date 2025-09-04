import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      dts: {
        bundle: false,
        distPath: './dist-types/esm',
        experiments: {
          tsgo: true,
        },
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      dts: {
        bundle: false,
        distPath: './dist-types/cjs',
        experiments: {
          tsgo: true,
        },
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
