import { generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [generateBundleEsmConfig()],
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
});
