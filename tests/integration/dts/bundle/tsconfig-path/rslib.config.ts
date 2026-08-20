import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      dts: {
        bundle: {
          tsconfigPath: './tsconfig.bundle.json',
          bundledPackages: ['@scope/foo'],
        },
      },
    }),
  ],
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
});
