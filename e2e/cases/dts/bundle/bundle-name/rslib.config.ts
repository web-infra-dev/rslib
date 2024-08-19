import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      dts: {
        bundle: true,
      },
    }),
    generateBundleCjsConfig(),
  ],
  source: {
    entry: {
      bundleName: '../__fixtures__/src/index.ts',
    },
    tsconfigPath: '../__fixtures__/tsconfig.json',
  },
});
