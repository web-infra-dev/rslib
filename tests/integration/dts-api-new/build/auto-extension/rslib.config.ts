import { fileURLToPath } from 'node:url';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleCjsConfig({
      bundle: false,
      dts: {
        autoExtension: true,
        distPath: './dist/types',
        bundle: false,
        build: true,
        tsgo: true,
        typescriptPath: fileURLToPath(import.meta.resolve('typescript7-api')),
      },
    }),
  ],
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
});
