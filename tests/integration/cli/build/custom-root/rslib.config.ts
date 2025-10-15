import { join } from 'node:path';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: './dist/root',
      },
    }),
    generateBundleCjsConfig({
      output: {
        distPath: './dist/root',
      },
    }),
  ],
  source: {
    entry: {
      index: join(__dirname, '../src/index.ts'),
    },
  },
});
