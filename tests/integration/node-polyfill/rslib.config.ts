import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';
import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: true,
      plugins: [pluginNodePolyfill()],
      source: {
        entry: {
          index: './src/index.ts',
        },
      },
      output: {
        distPath: {
          root: './dist/esm/bundle',
        },
      },
    }),
  ],
});
