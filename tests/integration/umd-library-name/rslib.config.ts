import { defineConfig } from '@rslib/core';
import { generateBundleUmdConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleUmdConfig({
      umdName: 'MyLibrary',
      output: {
        distPath: {
          root: './dist/string',
        },
      },
    }),
    generateBundleUmdConfig({
      umdName: ['MyLibrary1', 'MyLibrary2'],
      output: {
        distPath: {
          root: './dist/array',
        },
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
