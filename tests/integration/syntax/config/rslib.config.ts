import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      syntax: 'es2015',
      output: {
        distPath: { root: 'dist/esm/0' },
      },
    }),
    generateBundleEsmConfig({
      syntax: ['es2022'],
      output: {
        distPath: { root: 'dist/esm/1' },
      },
    }),
    generateBundleCjsConfig({
      syntax: ['node 20'],
      output: {
        distPath: { root: 'dist/cjs/0' },
      },
    }),
    generateBundleCjsConfig({
      syntax: ['node 20', 'es5'],
      output: {
        distPath: { root: 'dist/cjs/1' },
      },
    }),
  ],
  source: {
    entry: {
      index: '../__fixtures__/src/index.ts',
    },
  },
});
