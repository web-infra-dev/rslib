import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({ dts: { autoExtension: true } }),
    generateBundleCjsConfig({ dts: { autoExtension: true } }),
  ],
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
});
