import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    // 0. bundle
    // esm
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/esm/bundle',
          image: 'assets/bundle',
        },
      },
    }),
    generateBundleCjsConfig({
      output: {
        distPath: {
          root: './dist/esm/bundle',
          image: 'assets/bundle',
        },
      },
    }),
    // 1. bundleless
    // esm
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/esm/bundleless',
          image: 'assets/bundleless',
        },
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/esm/bundleless',
          image: 'assets/bundleless',
        },
      },
    }),
  ],
  output: {
    target: 'web',
  },
});
