import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/node',
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
    }),
  ],
  source: {
    entry: {
      entry1: ['./entry1.ts'],
      entry2: ['./entry2.ts'],
      entry3: ['./entry3.ts'],
      entry4: ['./entry4.ts'],
    },
  },
});
