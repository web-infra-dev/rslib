import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

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
