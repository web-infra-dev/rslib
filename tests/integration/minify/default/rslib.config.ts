import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig()],
  output: {
    target: 'node',
  },
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
});
