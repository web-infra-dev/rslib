import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: true,
      wasm: { mode: 'compile' },
      output: {
        distPath: './dist/dynamic/compile-bundle',
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      wasm: { mode: 'compile' },
      output: {
        distPath: './dist/dynamic/compile-bundleless',
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      wasm: { mode: 'preserve' },
      output: {
        distPath: './dist/dynamic/preserve-bundleless',
      },
    }),
  ],
  output: {
    target: 'node',
  },
});
