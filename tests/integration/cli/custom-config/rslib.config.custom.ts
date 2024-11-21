import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/custom',
        },
      },
    }),
    generateBundleCjsConfig({
      output: {
        distPath: {
          root: './dist/custom',
        },
      },
    }),
  ],
});
