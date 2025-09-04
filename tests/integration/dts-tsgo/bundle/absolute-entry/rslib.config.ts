import { join } from 'node:path';
import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      dts: {
        bundle: true,
        experiments: {
          tsgo: true,
        },
      },
    }),
  ],
  source: {
    entry: {
      index: join(__dirname, '../__fixtures__/src/index.ts'),
    },
    tsconfigPath: '../__fixtures__/tsconfig.json',
  },
});
