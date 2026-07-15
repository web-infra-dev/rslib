import { createRequire } from 'node:module';
import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

const require = createRequire(import.meta.url);

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: './dist/ts6',
      },
      dts: {
        bundle: false,
        typescriptPath: require.resolve('typescript/package.json'),
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: './dist/ts7',
      },
      dts: {
        bundle: false,
        typescriptPath: require.resolve('@typescript/native/package.json'),
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
