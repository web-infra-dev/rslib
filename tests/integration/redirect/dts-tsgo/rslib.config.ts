import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    // 0 - default - path: true extension: false
    generateBundleEsmConfig({
      dts: {
        experiments: {
          tsgo: true,
        },
      },
      output: {
        distPath: {
          root: './dist/default/esm',
        },
      },
    }),
    // 1 - path: false extension: false
    generateBundleEsmConfig({
      dts: {
        experiments: {
          tsgo: true,
        },
      },
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
    // 2 - path: true extension: true
    generateBundleEsmConfig({
      dts: {
        experiments: {
          tsgo: true,
        },
      },
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
    // 3 - path: false extension: true
    generateBundleEsmConfig({
      dts: {
        experiments: {
          tsgo: true,
        },
      },
      output: {
        distPath: {
          root: './dist/path-false-extension-true/esm',
        },
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
        experiments: {
          tsgo: true,
        },
        autoExtension: true,
      },
      output: {
        distPath: {
          root: './dist/auto-extension-true/esm',
        },
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
        experiments: {
          tsgo: true,
        },
        autoExtension: true,
      },
      output: {
        distPath: {
          root: './dist/auto-extension-true/cjs',
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
