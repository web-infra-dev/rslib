import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      dts: {
        distPath: './dist-types/esm',
        bundle: false,
        build: true,
        experiments: {
          tsgo: true,
        },
      },
      source: {
        tsconfigPath: './tsconfig.esm.json',
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      dts: {
        distPath: './dist-types/cjs',
        bundle: false,
        build: true,
        experiments: {
          tsgo: true,
        },
      },
      source: {
        tsconfigPath: './tsconfig.cjs.json',
      },
    }),
  ],
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
});
