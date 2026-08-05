import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    // 0. bundle
    generateBundleEsmConfig({
      output: {
        distPath: './dist/esm/bundle',
      },
    }),
    generateBundleCjsConfig({
      output: {
        distPath: './dist/cjs/bundle',
      },
    }),
    // 1. bundleless
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: './dist/esm/bundleless',
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      output: {
        distPath: './dist/cjs/bundleless',
      },
    }),
  ],
  output: {
    target: 'node',
  },
});
