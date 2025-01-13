import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    // 0. bundle
    // esm
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/esm/bundle-default',
        },
      },
      plugins: [
        pluginSvgr({
          mixedImport: true,
        }),
      ],
    }),
    // cjs
    generateBundleCjsConfig({
      output: {
        distPath: {
          root: './dist/cjs/bundle-default',
        },
      },
      plugins: [
        pluginSvgr({
          mixedImport: true,
        }),
      ],
    }),
    // 1. bundleless
    // esm
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/esm/bundleless-default',
        },
      },
      plugins: [
        pluginSvgr({
          mixedImport: true,
        }),
      ],
    }),
    // cjs
    generateBundleCjsConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/cjs/bundleless-default',
        },
      },
      plugins: [
        pluginSvgr({
          mixedImport: true,
        }),
      ],
    }),
  ],
  output: {
    target: 'web',
  },
  plugins: [pluginReact()],
});
