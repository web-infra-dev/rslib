import { fileURLToPath } from 'node:url';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      dts: {
        bundle: false,
        tsgo: true,
        typescriptPath: fileURLToPath(import.meta.resolve('typescript7-api')),
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      dts: {
        bundle: false,
        tsgo: true,
        typescriptPath: fileURLToPath(import.meta.resolve('typescript7-api')),
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
