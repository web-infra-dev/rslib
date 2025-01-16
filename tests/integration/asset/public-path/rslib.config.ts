import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig, generateBundleUmdConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleUmdConfig({
      output: {
        assetPrefix: '/public/path',
      },
    }),
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/esm/bundle',
        },
        assetPrefix: '/public/path',
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/esm/bundle-false',
        },
        assetPrefix: '/public/path',
      },
    }),
  ],
  output: {
    target: 'web',
  },
});
