import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      dts: {
        bundle: true,
        isolated: true,
      },
      output: {
        distPath: './dist-bundle/esm',
      },
    }),
    generateBundleCjsConfig({
      dts: {
        bundle: true,
        isolated: true,
        autoExtension: true,
      },
      output: {
        distPath: './dist-bundle/cjs',
      },
    }),
  ],
  source: {
    entry: {
      index: '../__fixtures__/src/index.ts',
    },
    tsconfigPath: '../__fixtures__/tsconfig.json',
  },
});
