import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      autoExtension: false,
      source: {
        entry: {
          index: './src/index.ts',
          worker: './src/worker.ts',
        },
      },
    }),
    generateBundleCjsConfig({
      autoExtension: false,
      source: {
        entry: {
          index: './src/index.ts',
          worker: './src/worker.ts',
        },
      },
    }),
  ],
});
