import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        filename: {
          js: '[name].[contenthash:8].js',
        },
      },
    }),
    generateBundleCjsConfig({
      autoExtension: false,
      output: {
        filename: {
          js: '[name].cjs',
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
