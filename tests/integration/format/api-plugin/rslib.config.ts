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
  ],
});
