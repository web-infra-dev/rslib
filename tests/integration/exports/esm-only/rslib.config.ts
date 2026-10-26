import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig()],
  source: {
    entry: {
      index: '../__fixtures__/src/index.ts',
    },
  },
});
