import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      source: {
        entry: {
          entry1: './entry1.ts',
        },
      },
      tools: {
        rspack: {
          resolve: {
            mainFields: ['source', 'module', 'main'],
          },
        },
      },
    }),
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/node',
        },
        target: 'node',
      },
      source: {
        entry: {
          entry2: './entry2.ts',
        },
      },
    }),
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/browser',
        },
        target: 'web',
      },
      source: {
        entry: {
          entry2: './entry2.ts',
        },
      },
    }),
  ],
});
