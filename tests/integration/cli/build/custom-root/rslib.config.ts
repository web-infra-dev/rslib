import { join } from 'node:path';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/root',
        },
      },
    }),
    generateBundleCjsConfig({
      output: {
        distPath: {
          root: './dist/root',
        },
      },
    }),
  ],
  source: {
    entry: {
      index: join(__dirname, '../src/index.ts'),
    },
  },
});
