import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: { distPath: './dist/consumer' },
    }),
  ],
  source: {
    entry: {
      a: './dist/esm/a.mjs',
      b: './dist/esm/b.mjs',
    },
  },
  output: {
    target: 'node',
    filename: { js: '[name].mjs' },
  },
});
