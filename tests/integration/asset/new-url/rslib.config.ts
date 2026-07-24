import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    // 0. bundle
    // esm
    generateBundleEsmConfig({
      output: {
        distPath: './dist/esm/bundle',
      },
    }),
    // cjs
    generateBundleCjsConfig({
      output: {
        distPath: './dist/cjs/bundle',
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
    // cjs
    generateBundleCjsConfig({
      bundle: false,
      source: {
        entry: { index: ['src/**', '!src/**/*.svg'] },
      },
      output: {
        distPath: './dist/cjs/bundleless',
      },
    }),
  ],
  output: {
    target: 'web',
  },
});
