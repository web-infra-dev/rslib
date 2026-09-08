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
    generateBundleEsmConfig({
      bundle: false,
      wasm: false,
      output: {
        distPath: './dist/bundleless-disabled',
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: './dist/bundleless-external',
        externals: { './add.wasm?inline': './external.wasm' },
      },
    }),
    generateBundleEsmConfig({
      wasm: false,
      output: {
        distPath: './dist/bundle-disabled',
      },
    }),
  ],
  output: {
    target: 'node',
  },
});
