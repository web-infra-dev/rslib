import { defineConfig } from '@rslib/core';
import { generateBundleUmdConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleUmdConfig({
      output: {
        assetPrefix: '/public/path/bundleless',
      },
    }),
  ],
  source: {
    entry: {
      index: './src/index.js',
    },
  },
  output: {
    target: 'web',
  },
});
