import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      source: {
        entry: {
          index: './src/index.js',
        },
      },
    }),
    generateBundleCjsConfig({
      source: {
        entry: {
          index: './src/index.js',
        },
      },
    }),
  ],
});
