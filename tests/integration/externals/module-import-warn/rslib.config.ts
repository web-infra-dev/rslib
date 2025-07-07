import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

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
    externals: ['bar', /^qux$/, 'quxx'],
  },
  performance: {
    buildCache: false,
  },
});
