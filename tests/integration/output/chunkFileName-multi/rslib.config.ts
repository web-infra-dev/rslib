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
