import { defineConfig } from '@rslib/core';
import { generateBundleUmdConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleUmdConfig({
      umdName: 'MyLibrary',
      output: {
        distPath: './dist/string',
      },
    }),
    generateBundleUmdConfig({
      umdName: ['MyLibrary', 'Utils'],
      output: {
        distPath: './dist/array',
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
    externals: {
      react: 'react',
    },
  },
});
