import {
  pluginNodePolyfill,
  resolvedPolyfillToModules,
} from '@rsbuild/plugin-node-polyfill';
import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      source: {
        entry: {
          index: ['./src/**'],
        },
      },
      output: {
        externals: Object.entries(resolvedPolyfillToModules).reduce(
          (acc, [key, value]) => {
            acc[key] = `node-commonjs ${value}`;
            return acc;
          },
          {} as Record<string, string>,
        ),
        distPath: {
          root: './dist/esm/bundleless',
        },
      },
    }),
  ],
  output: {
    target: 'web',
  },
  plugins: [pluginNodePolyfill()],
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
});
