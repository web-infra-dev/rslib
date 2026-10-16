import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      dts: {
        bundle: true,
        tsgo: true,
      },
      output: {
        distPath: './dist/esm/default',
      },
    }),
    generateBundleEsmConfig({
      dts: {
        bundle: {
          bundledPackages: [],
        },
        tsgo: true,
      },
      output: {
        distPath: './dist/esm/override-empty-array',
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
        tsgo: true,
      },
      output: {
        distPath: './dist/esm/override-array-string',
      },
    }),
  ],
});
