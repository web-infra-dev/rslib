import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    // 0 - default - path: true extension: false
    generateBundleEsmConfig({
      dts: {
        isolated: true,
      },
      output: {
        distPath: './dist-isolated/default/esm',
      },
    }),
    // 1 - path: false extension: false
    generateBundleEsmConfig({
      dts: {
        isolated: true,
      },
      output: {
        distPath: './dist-isolated/path-false/esm',
      },
      redirect: {
        dts: {
          path: false,
        },
      },
    }),
    // 2 - path: true extension: true
    generateBundleEsmConfig({
      dts: {
        isolated: true,
      },
      output: {
        distPath: './dist-isolated/extension-true/esm',
      },
      redirect: {
        dts: {
          extension: true,
        },
      },
    }),
    // 3 - path: false extension: true
    generateBundleEsmConfig({
      dts: {
        isolated: true,
      },
      output: {
        distPath: './dist-isolated/path-false-extension-true/esm',
      },
      redirect: {
        dts: {
          path: false,
          extension: true,
        },
      },
    }),
    // 4 - extension: true with dts.autoExtension true
    generateBundleEsmConfig({
      dts: {
        autoExtension: true,
        isolated: true,
      },
      output: {
        distPath: './dist-isolated/auto-extension-true/esm',
      },
      redirect: {
        dts: {
          extension: true,
        },
      },
    }),
    // 5 - extension: true with dts.autoExtension true
    generateBundleCjsConfig({
      dts: {
        autoExtension: true,
        isolated: true,
      },
      output: {
        distPath: './dist-isolated/auto-extension-true/cjs',
      },
      redirect: {
        dts: {
          extension: true,
        },
      },
    }),
  ],
});
