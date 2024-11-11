import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      source: {
        entry: {
          index: './src/index.js',
        },
      },
      output: {
        distPath: {
          root: './dist/esm/bundle-default',
        },
      },
      plugins: [pluginSvgr()],
    }),
    generateBundleEsmConfig({
      source: {
        entry: {
          index: './src/index.js',
        },
      },
      bundle: false,
      output: {
        distPath: {
          root: './dist/esm/bundleless-default',
        },
      },
      plugins: [pluginSvgr()],
    }),
    generateBundleEsmConfig({
      source: {
        entry: {
          index: './src/namedExport.js',
        },
      },
      output: {
        distPath: {
          root: './dist/esm/bundle-named',
        },
      },
      plugins: [
        pluginSvgr({
          svgrOptions: {
            exportType: 'named',
          },
        }),
      ],
    }),
    generateBundleEsmConfig({
      source: {
        entry: {
          index: './src/namedExport.js',
        },
      },
      bundle: false,
      output: {
        distPath: {
          root: './dist/esm/bundleless-named',
        },
      },
      plugins: [
        pluginSvgr({
          svgrOptions: {
            exportType: 'named',
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
