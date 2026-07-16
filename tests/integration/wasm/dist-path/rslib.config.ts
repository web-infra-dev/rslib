import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: true,
      wasm: { mode: 'compile' },
      output: {
        distPath: {
          root: './dist/dist-path/compile-bundle',
          wasm: 'user-defined/wasm-assets',
        },
      },
    }),
  ],
  output: {
    target: 'node',
  },
});
