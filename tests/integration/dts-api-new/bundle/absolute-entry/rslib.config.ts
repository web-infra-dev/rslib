import { fileURLToPath } from 'node:url';
import { defineConfig } from '@rslib/core';
import { join } from 'node:path';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      dts: {
        bundle: true,
        tsgo: true,
        typescriptPath: fileURLToPath(import.meta.resolve('typescript7-api')),
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
