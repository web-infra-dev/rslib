import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

const baseExternals = {
  externals: { 'lodash/zip': 'lodash-es/zip', 'node:fs': 'memfs' },
};

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        externals: baseExternals,
        distPath: 'dist/bundle',
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      output: {
        externals: { ...baseExternals, './foo': './foo2' },
        distPath: 'dist/bundle-false',
      },
    }),
  ],
});
