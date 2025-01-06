import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: 'dist/esm-bundle',
        },
      },
    }),
    generateBundleCjsConfig({
      output: {
        distPath: {
          root: 'dist/cjs-bundle',
        },
      },
    }),
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: 'dist/esm-bundle-false',
        },
      },
      bundle: false,
    }),
    generateBundleCjsConfig({
      output: {
        distPath: {
          root: 'dist/cjs-bundle-false',
        },
      },
      bundle: false,
    }),
  ],
});
