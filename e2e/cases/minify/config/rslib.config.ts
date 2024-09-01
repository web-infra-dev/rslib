import { generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [generateBundleEsmConfig()],
  output: {
    target: 'node',
    minify: false,
  },
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
});
