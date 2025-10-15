import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    // ESM
    generateBundleEsmConfig({
      output: {
        distPath: './dist/bundle-esm',
      },
    }),
    // CJS
    generateBundleCjsConfig({
      output: {
        distPath: './dist/bundle-cjs',
      },
    }),
    // ESM bundleless
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: './dist/bundleless-esm',
      },
    }),
    // CJS bundleless
    generateBundleCjsConfig({
      bundle: false,
      output: {
        distPath: './dist/bundleless-cjs',
      },
    }),
  ],
});
