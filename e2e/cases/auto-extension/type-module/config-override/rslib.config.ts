import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

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
