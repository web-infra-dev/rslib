import { defineConfig } from '@rslib/core';
import { generateBundleUmdConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleUmdConfig()],
  output: {
    externals: {
      react: 'react-aliased',
    },
  },
  source: {
    entry: {
      index: './src/index.js',
    },
  },
});
