import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      dts: {
        bundle: false,
        alias: {
          'prebundle-pkg': './compile/prebundle-pkg',
        },
      },
    }),
    generateBundleCjsConfig({
      dts: {
        bundle: false,
        alias: {
          'prebundle-pkg': './compile/prebundle-pkg',
        },
      },
    }),
  ],
});
