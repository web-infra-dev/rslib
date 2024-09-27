import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/esm/bundle',
        },
      },
    }),
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/esm/bundleless',
        },
      },
      bundle: false,
    }),
    generateBundleCjsConfig({
      output: {
        distPath: {
          root: './dist/cjs/bundle',
        },
      },
    }),
    generateBundleCjsConfig({
      output: {
        distPath: {
          root: './dist/cjs/bundleless',
        },
      },
      bundle: false,
    }),
  ],
  source: {
    entry: {
      index: './src/index.ts',
    },
    transformImport: [
      {
        libraryName: '@arco-design/web-react',
        style: true,
        libraryDirectory: 'es',
      },
    ],
  },
});
