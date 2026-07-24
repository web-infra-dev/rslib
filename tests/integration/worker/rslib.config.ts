import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: './dist/esm-bundle',
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: './dist/esm-bundleless',
      },
    }),
  ],
});
