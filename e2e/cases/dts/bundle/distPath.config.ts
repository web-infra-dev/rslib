import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    generateBundleEsmConfig(__dirname, {
      dts: {
        bundle: true,
        distPath: './dist/custom',
      },
    }),
    generateBundleCjsConfig(__dirname),
  ],
  source: {
    entry: {
      main: './src/index.ts',
    },
  },
});
