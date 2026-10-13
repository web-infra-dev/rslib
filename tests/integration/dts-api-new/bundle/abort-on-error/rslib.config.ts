import { fileURLToPath } from 'node:url';
import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      dts: {
        bundle: true,
        abortOnError: false,
        tsgo: true,
        typescriptPath: fileURLToPath(import.meta.resolve('typescript7-api')),
      },
    }),
  ],
  source: {
    entry: {
      index: './src/index.ts',
    },
    tsconfigPath: 'tsconfig.json',
  },
});
