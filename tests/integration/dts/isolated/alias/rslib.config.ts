import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      dts: {
        isolated: true,
        alias: {
          'aliased-pkg': './compile/aliased-pkg',
        },
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      dts: {
        isolated: true,
        autoExtension: true,
        alias: {
          'aliased-pkg': './compile/aliased-pkg',
        },
      },
    }),
  ],
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
});
