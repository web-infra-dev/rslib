import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    generateBundleEsmConfig(__dirname, {
      dts: {
        bundle: true,
      },
    }),
    generateBundleCjsConfig(__dirname),
  ],
  source: {
    entry: {
      bundleName: './src/index.ts',
    },
  },
});
