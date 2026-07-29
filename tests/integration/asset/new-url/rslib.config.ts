import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

// File asset reference `new URL('./assets/logo.svg', import.meta.url)`.
// Matrix: esm × { bundle, bundleless }.
export default defineConfig({
  lib: [
    // 0. bundle
    // esm
    generateBundleEsmConfig({
      output: {
        distPath: './dist/esm/bundle',
      },
    }),
    // 1. bundleless
    // esm
    generateBundleEsmConfig({
      bundle: false,
      source: {
        // Exclude assets from the entry glob so they are only emitted via
        // `new URL()`, not turned into standalone JS chunks.
        entry: { index: ['src/**', '!src/**/*.svg'] },
      },
      output: {
        distPath: './dist/esm/bundleless',
      },
    }),
  ],
  output: {
    target: 'web',
  },
});
