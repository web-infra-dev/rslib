import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      shims: { esm: { __dirname: true, __filename: true } },
      source: {
        entry: {
          index: './src/index.ts',
        },
      },
      output: {
        distPath: {
          root: './dist/enabled/esm0',
        },
      },
    }),
    generateBundleEsmConfig({
      shims: { esm: { __dirname: true, __filename: true } },
      syntax: 'esnext',
      source: {
        entry: {
          index: './src/index.ts',
        },
      },
      output: {
        distPath: {
          root: './dist/enabled/esm1',
        },
      },
    }),
    generateBundleEsmConfig({
      shims: { esm: { __dirname: true, __filename: true } },
      syntax: 'esnext',
      source: {
        entry: {
          index: './src/require.ts',
        },
      },
      output: {
        copy: [{ from: './src/ok.cjs' }],
        distPath: {
          root: './dist/enabled/esm2',
        },
      },
    }),
  ],
  output: {
    target: 'node',
  },
});
