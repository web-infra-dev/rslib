import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      dts: {
        bundle: false,
        distPath: 'dist-types/esm',
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      dts: {
        bundle: false,
        distPath: 'dist-types/cjs',
      },
    }),
  ],
  source: {
    entry: {
      index: ['../__fixtures__/src/**'],
    },
  },
});
