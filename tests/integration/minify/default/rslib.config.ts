import { defineConfig } from '@rslib/core';
import path from 'node:path';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig()],
  source: {
    entry: {
      index: path.resolve(__dirname, '../__fixtures__/src/index.ts'),
    },
  },
  output: {
    externals: ['react/jsx-runtime'],
  },
});
