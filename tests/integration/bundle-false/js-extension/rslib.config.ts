import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/basic-esm',
        },
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/basic-cjs',
        },
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/no-auto-extension-esm',
        },
        filename: {
          js: '[name].mjs',
        },
      },
      autoExtension: false,
    }),
    generateBundleCjsConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/no-auto-extension-cjs',
        },
        filename: {
          js: '[name].cjs',
        },
      },
      autoExtension: false,
    }),
  ],
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
});
