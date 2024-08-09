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
      main: '../__fixtures__/src/index.ts',
    },
    tsconfigPath: '../__fixtures__/tsconfig.json',
  },
});
