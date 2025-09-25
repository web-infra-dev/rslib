import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleCjsConfig({
      bundle: false,
    }),
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: 'dist/esm0',
        },
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: 'dist/esm1',
        },
        filename: {
          js: '[name].jsx',
        },
      },
    }),
  ],
  source: {
    entry: {
      index: './src/**',
    },
  },
  plugins: [
    pluginReact({
      swcReactOptions: {
        runtime: 'preserve',
      },
    }),
  ],
});
