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
      },
    }),
    generateBundleCjsConfig({
      output: {
        filename: {
          js: '[name].[contenthash:8].js',
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
