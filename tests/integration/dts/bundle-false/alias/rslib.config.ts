import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      dts: {
        bundle: false,
        alias: {
          express: './compile/express',
        },
      },
    }),
    generateBundleCjsConfig({
      dts: {
        bundle: false,
        alias: {
          express: './compile/express',
        },
      },
    }),
  ],
});
