import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  output: {
    filename: {
      js: 'static/js/[name].[contenthash:8].js',
    },
  },
  lib: [
    generateBundleEsmConfig({
      source: {
        entry: {
          lib1: './src/lib1.js',
        },
      },
    }),
    generateBundleEsmConfig({
      source: {
        entry: {
          lib2: './src/lib2.js',
        },
      },
    }),
  ],
});
