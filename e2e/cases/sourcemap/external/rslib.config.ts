import { generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [generateBundleEsmConfig()],
  source: {
    entry: {
      index: '../__fixtures__/src/index.ts',
    },
  },
  output: {
    sourceMap: {
      js: 'cheap-module-source-map',
    },
  },
});
