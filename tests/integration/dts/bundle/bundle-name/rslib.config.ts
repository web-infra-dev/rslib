import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

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
