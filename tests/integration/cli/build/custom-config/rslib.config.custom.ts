import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: './dist/custom',
      },
    }),
    generateBundleCjsConfig({
      output: {
        distPath: './dist/custom',
      },
    }),
  ],
});
