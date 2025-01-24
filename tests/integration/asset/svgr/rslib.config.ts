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
    // 1. bundleless mixedImport
    // esm
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/esm/bundleless-mixed',
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
          root: './dist/cjs/bundleless-mixed',
        },
      },
      plugins: [
        pluginSvgr({
          mixedImport: true,
        }),
      ],
    }),
    // 2. bundleless only svgr
    // esm
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/esm/bundleless-only-svgr',
        },
      },
      plugins: [
        pluginSvgr({
          svgrOptions: {
            exportType: 'default',
          },
          exclude: /logo2\.svg$/,
        }),
      ],
    }),
    // cjs
    generateBundleCjsConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/cjs/bundleless-only-svgr',
        },
      },
      plugins: [
        pluginSvgr({
          svgrOptions: {
            exportType: 'default',
          },
          exclude: /logo2\.svg$/,
        }),
      ],
    }),
  ],
  output: {
    target: 'web',
  },
  plugins: [pluginReact()],
});
