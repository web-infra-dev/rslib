import { fileURLToPath } from 'node:url';
import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: './dist/ts6',
      },
      dts: {
        bundle: false,
        typescriptPath: fileURLToPath(
          import.meta.resolve('typescript/package.json'),
        ),
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: './dist/ts7',
      },
      dts: {
        bundle: false,
        typescriptPath: fileURLToPath(
          import.meta.resolve('@typescript/native/package.json'),
        ),
      },
    }),
  ],
  source: {
    entry: {
      index: ['../__fixtures__/src/**'],
    },
    tsconfigPath: '../__fixtures__/tsconfig.json',
  },
});
