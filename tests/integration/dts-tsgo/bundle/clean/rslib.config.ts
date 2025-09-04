import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      dts: {
        bundle: true,
        distPath: './dist-types/esm',
        experiments: {
          tsgo: true,
        },
      },
    }),
    generateBundleCjsConfig({
      dts: {
        bundle: true,
        distPath: './dist-types/cjs',
        experiments: {
          tsgo: true,
        },
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
