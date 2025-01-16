import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    // 0. default
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: 'dist/default/esm',
        },
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      output: {
        distPath: {
          root: 'dist/default/cjs',
        },
      },
    }),
    // 1. redirect.asset: false
    generateBundleEsmConfig({
      bundle: false,
      redirect: { asset: false },
      output: {
        distPath: {
          root: 'dist/asset-false/esm',
        },
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      redirect: { asset: false },
      output: {
        distPath: {
          root: 'dist/asset-false/cjs',
        },
      },
    }),
  ],
  output: {
    target: 'web',
  },
});
