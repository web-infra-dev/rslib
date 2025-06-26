import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      dts: {
        bundle: true,
      },
      output: {
        distPath: {
          root: './dist/esm/default',
        },
      },
    }),
    generateBundleEsmConfig({
      dts: {
        bundle: {
          bundledPackages: [],
        },
      },
      output: {
        distPath: {
          root: './dist/esm/override-empty-array',
        },
      },
    }),
    generateBundleEsmConfig({
      dts: {
        bundle: {
          bundledPackages: [
            '@reduxjs/toolkit',
            '@standard-schema/spec',
            '@standard-schema/utils',
            'immer',
            'redux',
            'redux-thunk',
            'reselect',
          ],
        },
      },
      output: {
        distPath: {
          root: './dist/esm/override-array-string',
        },
      },
    }),
  ],
});
