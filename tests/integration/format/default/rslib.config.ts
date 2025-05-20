import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    // ESM
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/bundle-esm',
        },
      },
    }),
    // CJS
    generateBundleCjsConfig({
      output: {
        distPath: {
          root: './dist/bundle-cjs',
        },
      },
    }),
    // ESM bundleless
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/bundleless-esm',
        },
      },
    }),
    // CJS bundleless
    generateBundleCjsConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/bundleless-cjs',
        },
      },
    }),
  ],
});
