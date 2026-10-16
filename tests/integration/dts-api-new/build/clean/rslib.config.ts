import { fileURLToPath } from 'node:url';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      dts: {
        distPath: './dist-types/esm',
        bundle: false,
        build: true,
        tsgo: true,
        typescriptPath: fileURLToPath(import.meta.resolve('typescript7-api')),
      },
      source: {
        tsconfigPath: './tsconfig.esm.json',
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      dts: {
        distPath: './dist-types/cjs',
        bundle: false,
        build: true,
        tsgo: true,
        typescriptPath: fileURLToPath(import.meta.resolve('typescript7-api')),
      },
      source: {
        tsconfigPath: './tsconfig.cjs.json',
      },
    }),
  ],
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
});
