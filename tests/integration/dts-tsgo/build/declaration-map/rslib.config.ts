import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      dts: {
        autoExtension: true,
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
        autoExtension: true,
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
});
