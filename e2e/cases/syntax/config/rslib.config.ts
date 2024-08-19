import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        syntax: 'es2015',
      },
    }),
    generateBundleCjsConfig({
      output: {
        syntax: ['node 20'],
      },
    }),
  ],
  source: {
    entry: {
      index: '../__fixtures__/src/index.ts',
    },
  },
});
