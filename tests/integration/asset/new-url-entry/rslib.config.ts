import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

// `new URL()` targets built as modules instead of copied as assets.
// Matrix: esm × { bundle, bundleless }.
export default defineConfig({
  lib: [
    // 0. bundle
    // esm
    generateBundleEsmConfig({
      newUrl: { mode: 'entry' },
      output: {
        distPath: './dist/esm/bundle',
      },
    }),
    // 1. bundleless
    // esm
    generateBundleEsmConfig({
      bundle: false,
      newUrl: { mode: 'entry' },
      source: {
        // Exclude assets from the entry glob so the SVG is only emitted via
        // `new URL()`, not turned into a standalone JS chunk.
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
