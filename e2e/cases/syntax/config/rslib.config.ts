import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: { root: 'dist/esm/0' },
        syntax: 'es2015',
      },
    }),
    generateBundleEsmConfig({
      output: {
        distPath: { root: 'dist/esm/1' },
        syntax: ['es2022'],
      },
    }),
    generateBundleCjsConfig({
      output: {
        distPath: { root: 'dist/cjs/0' },
        syntax: ['node 20'],
      },
    }),
    generateBundleCjsConfig({
      output: {
        distPath: { root: 'dist/cjs/1' },
        syntax: ['node 20', 'es5'],
      },
    }),
  ],
  source: {
    entry: {
      index: '../__fixtures__/src/index.ts',
    },
  },
});
