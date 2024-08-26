import { generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        externals: { foo: 'foo' },
      },
    }),
  ],
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
  output: {
    externals: ['bar'],
  },
});
