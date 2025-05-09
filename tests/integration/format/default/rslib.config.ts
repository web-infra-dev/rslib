import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/bundle-esm',
        },
      },
    }),
    generateBundleCjsConfig({
      output: {
        distPath: {
          root: './dist/bundle-cjs',
        },
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/bundleless-esm',
        },
      },
    }),
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
