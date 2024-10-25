import path from 'node:path';
import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig()],
  output: {
    target: 'node',
    minify: false,
  },
  source: {
    entry: {
      index: path.resolve(__dirname, '../__fixtures__/src/index.ts'),
    },
  },
});
