import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleCjsConfig({
      output: {
        distPath: './dist/bundle/cjs-default',
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      output: {
        minify: false,
        distPath: './dist/bundleless/cjs-no-minify',
      },
    }),
    generateBundleEsmConfig({
      output: {
        distPath: './dist/bundle/esm-default',
      },
    }),
    generateBundleEsmConfig({
      output: {
        minify: true,
        distPath: './dist/bundle/esm-minify',
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: './dist/bundleless/esm-default',
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      output: {
        minify: true,
        distPath: './dist/bundleless/esm-minify',
      },
    }),
  ],
  output: {
    target: 'node',
  },
});
