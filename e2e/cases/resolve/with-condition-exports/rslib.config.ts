import { generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/node',
        },
        target: 'node',
      },
    }),
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/browser',
        },
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
