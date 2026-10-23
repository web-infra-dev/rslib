import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: true,
      output: {
        distPath: './dist/bundle',
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: './dist/bundleless',
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      wasm: { mode: 'compile' },
      output: {
        distPath: './dist/bundleless-compile',
      },
    }),
  ],
  output: {
    target: 'node',
  },
});
