import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    // 0. bundle
    // esm
    generateBundleEsmConfig({
      source: {
        assetsInclude: /\.txt/,
      },
      output: {
        distPath: './dist/esm/bundle',
      },
    }),
    // 1. bundleless
    // esm
    generateBundleEsmConfig({
      bundle: false,
      source: {
        assetsInclude: /\.txt/,
      },
      output: {
        distPath: './dist/esm/bundleless',
      },
    }),
  ],
  output: {
    target: 'web',
  },
});
