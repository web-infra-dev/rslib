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
        distPath: './dist/esm/bundle-default',
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
        distPath: './dist/cjs/bundle-default',
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
      source: {
        entry: {
          index: ['src', '!src/css-entry.css'],
        },
      },
      output: {
        distPath: './dist/esm/bundleless-mixed',
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
      source: {
        entry: {
          index: ['src', '!src/css-entry.css'],
        },
      },
      output: {
        distPath: './dist/cjs/bundleless-mixed',
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
      source: {
        entry: {
          index: ['src', '!src/css-entry.css'],
        },
      },
      output: {
        distPath: './dist/esm/bundleless-only-svgr',
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
      source: {
        entry: {
          index: ['src', '!src/css-entry.css'],
        },
      },
      output: {
        distPath: './dist/cjs/bundleless-only-svgr',
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
    // 3. bundleless svg in css
    // esm
    generateBundleEsmConfig({
      bundle: false,
      source: {
        entry: {
          index: ['src/css-entry.css'],
        },
      },
      output: {
        distPath: './dist/esm/bundleless-css-svg',
      },
      plugins: [
        pluginSvgr({
          svgrOptions: {
            exportType: 'default',
          },
        }),
      ],
    }),
    // cjs
    generateBundleCjsConfig({
      bundle: false,
      source: {
        entry: {
          index: ['src/css-entry.css'],
        },
      },
      output: {
        distPath: './dist/cjs/bundleless-css-svg',
      },
      plugins: [
        pluginSvgr({
          svgrOptions: {
            exportType: 'default',
          },
        }),
      ],
    }),
  ],
  output: {
    target: 'web',
  },
  plugins: [pluginReact()],
});
