import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      dts: {
        autoExtension: true,
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      dts: {
        autoExtension: true,
      },
    }),
  ],
});
