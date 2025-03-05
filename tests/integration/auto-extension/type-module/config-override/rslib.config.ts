import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        filename: {
          js: '[name].[contenthash:8].js',
        },
        distPath: {
          root: './dist/esm-override-filename',
        },
      },
    }),
    generateBundleCjsConfig({
      autoExtension: false,
      output: {
        filename: {
          js: '[name].cjs',
        },
        distPath: {
          root: './dist/cjs-override-filename',
        },
      },
    }),
    generateBundleEsmConfig({
      output: {
        filenameHash: true,
        distPath: {
          root: './dist/esm-override-filename-hash',
        },
      },
    }),
    generateBundleCjsConfig({
      autoExtension: false,
      output: {
        filenameHash: true,
        distPath: {
          root: './dist/cjs-override-filename-hash',
        },
      },
    }),
  ],
  source: {
    entry: {
      index: '../../__fixtures__/src/index.ts',
    },
  },
});
