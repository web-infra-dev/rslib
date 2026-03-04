import { defineConfig } from '@rslib/core';
import { generateBundleUmdConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleUmdConfig({
      bundle: false,
    }),
  ],
  source: {
    entry: {
      index: './src/index.js',
    },
  },
});
