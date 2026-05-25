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
      source: {
        entry: {
          index: ['../__fixtures__/src/**'],
        },
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
      source: {
        entry: {
          index: ['../__fixtures__/src/**'],
        },
      },
    }),
    generateBundleEsmConfig({
      dts: {
        bundle: true,
        isolated: true,
      },
      output: {
        distPath: './dist-bundle/esm',
      },
      source: {
        entry: {
          index: '../__fixtures__/src/index.ts',
        },
      },
    }),
    generateBundleCjsConfig({
      dts: {
        bundle: true,
        isolated: true,
        autoExtension: true,
      },
      output: {
        distPath: './dist-bundle/cjs',
      },
      source: {
        entry: {
          index: '../__fixtures__/src/index.ts',
        },
      },
    }),
  ],
  source: {
    tsconfigPath: '../__fixtures__/tsconfig.json',
  },
});
