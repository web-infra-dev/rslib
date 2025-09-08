import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      dts: {
        bundle: true,
        abortOnError: false,
        tsgo: true,
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
