import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleCjsConfig({
      output: {
        distPath: './dist/cjs',
        filename: {
          js: '[name].cjs',
        },
      },
    }),
  ],
  source: {
    entry: {
      index: './src/index.js',
    },
  },
});
