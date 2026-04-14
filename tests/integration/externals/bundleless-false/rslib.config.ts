import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      output: {
        externals: {
          'shell-quote': false,
        },
      },
    }),
  ],
  source: {
    entry: { index: './src/index.ts' },
  },
});
