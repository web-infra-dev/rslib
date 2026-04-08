import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig()],
  source: {
    entry: {
      index: '../__fixtures__/src/index.ts',
    },
    decorators: {
      version: '2022-03',
    },
    tsconfigPath: '../__fixtures__/tsconfig.json',
  },
});
