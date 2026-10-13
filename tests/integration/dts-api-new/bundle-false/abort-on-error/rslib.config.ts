import { fileURLToPath } from 'node:url';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      dts: {
        bundle: false,
        abortOnError: false,
        tsgo: true,
        typescriptPath: fileURLToPath(import.meta.resolve('typescript7-api')),
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
    }),
  ],
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
});
