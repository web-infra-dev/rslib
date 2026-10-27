import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: true,
      output: {
        distPath: './dist/bundle/esm',
      },
    }),
    generateBundleCjsConfig({
      bundle: true,
      output: {
        distPath: './dist/bundle/cjs',
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: './dist/bundleless/esm',
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      output: {
        distPath: './dist/bundleless/cjs',
      },
    }),
  ],
  source: {
    entry: {
      index: './src/index.tsx',
      foo: './src/foo.tsx',
      bar: './src/bar.tsx',
    },
  },
  output: {
    target: 'web',
    externals: ['react'],
  },
});
