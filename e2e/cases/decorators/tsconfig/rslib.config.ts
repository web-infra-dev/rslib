import { generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/esm/legacy',
        },
      },
    }),
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/esm/stage3',
        },
      },
      source: {
        decorators: {
          version: '2022-03',
        },
      },
    }),
  ],
  source: {
    entry: {
      index: '../__fixtures__/src/index.ts',
    },
    tsconfigPath: '../__fixtures__/tsconfig.decorators.json',
  },
});
