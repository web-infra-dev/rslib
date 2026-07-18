import { fileURLToPath } from 'node:url';
import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  // Explicit `tsgo` values make the test fail if `typescriptPath` resolves
  // to an unexpected TypeScript major version.
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: './dist/ts6',
      },
      dts: {
        bundle: false,
        tsgo: false,
        typescriptPath: fileURLToPath(import.meta.resolve('typescript')),
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: './dist/ts7',
      },
      dts: {
        bundle: false,
        tsgo: true,
        typescriptPath: fileURLToPath(
          import.meta.resolve('@typescript/native'),
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
