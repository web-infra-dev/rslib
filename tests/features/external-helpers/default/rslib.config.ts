import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      syntax: 'es5',
    }),
  ],
  source: {
    entry: {
      index: '../__fixtures__/src/index.ts',
    },
  },
});
