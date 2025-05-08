import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    // bundle default
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/bundle-default',
        },
      },
    }),
    // bundleless default
    generateBundleEsmConfig({
      bundle: false,
      source: {
        entry: {
          index: ['./src/**'],
        },
      },
      output: {
        distPath: {
          root: './dist/bundleless-default',
        },
      },
    }),
    // bundleless preserve JSON
    generateBundleEsmConfig({
      bundle: false,
      source: {
        entry: {
          index: ['./src/**', '!./src/**/*.json'],
        },
      },
      output: {
        copy: [{ from: './**/*.json', context: './src' }],
        externals: [/.*\.json$/],
        distPath: {
          root: './dist/bundleless-preserve-json',
        },
      },
    }),
  ],
});
