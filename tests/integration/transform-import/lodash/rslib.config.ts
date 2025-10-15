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
        libraryName: 'lodash',
        customName: 'lodash/{{ member }}',
      },
      // Rsbuild customName only support string type for performance reasons
      {
        libraryName: 'lodash/fp',
        customName: 'lodash/fp/{{ member }}',
      },
    ],
  },
});
