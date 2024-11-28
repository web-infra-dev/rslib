import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      dts: true,
    }),
    generateBundleCjsConfig({
      dts: true,
    }),
  ],
});
