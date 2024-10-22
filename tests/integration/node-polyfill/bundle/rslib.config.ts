import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: true,
      output: {
        distPath: {
          root: './dist/esm/bundle',
        },
      },
    }),
    generateBundleCjsConfig({
      bundle: true,
      output: {
        distPath: {
          root: './dist/cjs/bundle',
        },
      },
    }),
  ],
  plugins: [pluginNodePolyfill()],
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
});
