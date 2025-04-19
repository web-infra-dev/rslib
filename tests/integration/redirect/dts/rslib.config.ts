import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    // 0 - default
    generateBundleEsmConfig({
      dts: true,
      output: {
        distPath: {
          root: './dist/default/esm',
        },
      },
    }),
    // 1 - path: false
    generateBundleEsmConfig({
      dts: true,
      output: {
        distPath: {
          root: './dist/path-false/esm',
        },
      },
      redirect: {
        dts: {
          path: false,
        },
      },
    }),
    // 2 - extension: true
    generateBundleEsmConfig({
      dts: true,
      output: {
        distPath: {
          root: './dist/extension-true/esm',
        },
      },
      redirect: {
        dts: {
          extension: true,
        },
      },
    }),
    // 3 - extension: true with dts.autoExtension true
    generateBundleEsmConfig({
      dts: {
        autoExtension: true,
      },
      output: {
        distPath: {
          root: './dist/auto-extension-true',
        },
      },
      redirect: {
        dts: {
          extension: true,
        },
      },
    }),
    // 4 - extension: true with dts.autoExtension true
    generateBundleCjsConfig({
      dts: {
        autoExtension: true,
      },
      output: {
        distPath: {
          root: './dist/auto-extension-true',
        },
      },
      redirect: {
        dts: {
          extension: true,
        },
      },
    }),
  ],
});
