import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      autoExternal: false,
      dts: {
        bundle: true,
      },
    }),
    generateBundleCjsConfig({
      autoExternal: false,
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
