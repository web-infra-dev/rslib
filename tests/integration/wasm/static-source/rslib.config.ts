import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: true,
      wasm: { mode: 'compile' },
      output: {
        distPath: './dist/static-source/compile-bundle',
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      wasm: { mode: 'compile' },
      output: {
        distPath: './dist/static-source/compile-bundleless',
      },
    }),
    generateBundleEsmConfig({
      bundle: true,
      wasm: { mode: 'preserve' },
      output: {
        distPath: './dist/static-source/preserve-bundle',
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      wasm: { mode: 'preserve' },
      output: {
        distPath: './dist/static-source/preserve-bundleless',
      },
    }),
  ],
  output: {
    target: 'node',
  },
});
