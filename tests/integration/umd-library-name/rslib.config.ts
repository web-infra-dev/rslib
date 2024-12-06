import { defineConfig } from '@rslib/core';
import { generateBundleUmdConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleUmdConfig({
      umdName: 'MyLibrary',
    }),
  ],
  source: {
    entry: {
      index: './src/index.js',
    },
  },
  output: {
    target: 'web',
    externals: {
      react: 'react',
    },
  },
});
