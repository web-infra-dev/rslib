import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      source: {
        entry: {
          lib1: './src/lib1.js',
        },
      },
      output: {
        filename: {
          js: 'static1/js/[name].js',
        },
      },
    }),
    generateBundleEsmConfig({
      source: {
        entry: {
          lib2: './src/lib2.js',
        },
      },
      output: {
        filename: {
          js: 'static2/js/[name].[contenthash:8].js',
        },
      },
    }),
  ],
});
