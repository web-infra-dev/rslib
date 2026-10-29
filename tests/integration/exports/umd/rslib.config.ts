import { defineConfig } from '@rslib/core';
import { generateBundleUmdConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleUmdConfig()],
  source: {
    entry: {
      index: '../__fixtures__/src/index.ts',
    },
  },
});
