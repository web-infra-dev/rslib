import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      dts: {
        bundle: true,
      },
    }),
    generateBundleCjsConfig({
      dts: {
        bundle: true,
      },
    }),
  ],
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
});
