import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    // ESM
    generateBundleEsmConfig({
      source: {
        entry: {
          m1: './src/module1.js',
          m2: './src/module2.js',
        },
      },
    }),
    // CJS
    generateBundleCjsConfig({
      source: {
        entry: {
          m1: './src/module1.js',
          m2: './src/module2.js',
        },
      },
    }),
  ],
});
