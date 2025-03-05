import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      autoExtension: false,
      output: {
        filename: {
          js: '[name].mjs',
        },
        distPath: {
          root: './dist/esm-override-filename',
        },
      },
    }),
    generateBundleCjsConfig({
      output: {
        filename: {
          js: '[name].[contenthash:8].js',
        },
        distPath: {
          root: './dist/cjs-override-filename',
        },
      },
    }),
    generateBundleEsmConfig({
      autoExtension: false,
      output: {
        filenameHash: true,
        distPath: {
          root: './dist/esm-override-filename-hash',
        },
      },
    }),
    generateBundleCjsConfig({
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
