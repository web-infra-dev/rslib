import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: './dist/esm/bundle',
      },
    }),
    generateBundleEsmConfig({
      output: {
        distPath: './dist/esm/bundleless',
      },
      bundle: false,
    }),
    generateBundleCjsConfig({
      output: {
        distPath: './dist/cjs/bundle',
      },
    }),
    generateBundleCjsConfig({
      output: {
        distPath: './dist/cjs/bundleless',
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
