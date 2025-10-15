import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: 'dist/esm-bundle',
      },
    }),
    generateBundleCjsConfig({
      output: {
        distPath: 'dist/cjs-bundle',
      },
    }),
    generateBundleEsmConfig({
      output: {
        distPath: 'dist/esm-bundle-false',
      },
      bundle: false,
    }),
    generateBundleCjsConfig({
      output: {
        distPath: 'dist/cjs-bundle-false',
      },
      bundle: false,
    }),
  ],
});
