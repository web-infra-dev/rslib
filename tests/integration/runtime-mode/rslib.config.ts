import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig()],
  source: {
    entry: {
      a: './src/a.js',
      b: './src/b.js',
    },
  },
  output: {
    target: 'node',
    filename: { js: '[name].mjs' },
  },
  tools: {
    rspack: {
      optimization: {
        runtimeChunk: { name: 'runtime' },
      },
    },
  },
});
