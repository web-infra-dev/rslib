import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    // 0 default
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: 'dist/default/esm',
        },
      },
    }),
    // 1 js.path: false
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: 'dist/js-path-false/esm',
        },
      },
      redirect: {
        js: {
          path: false,
        },
      },
    }),
    // 2 js.extension: false
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: 'dist/js-extension-false/esm',
        },
      },
      redirect: {
        js: {
          extension: false,
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '~': './src',
    },
  },
  source: {
    entry: {
      index: './src/**',
    },
  },
});
