import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

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
