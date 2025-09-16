import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig } from 'rslib';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      bundle: false,
      syntax: ['node 18.12.0'],
      dts: {
        bundle: false,
        // Only use tsgo in local dev for faster build, disable it in CI until it's more stable
        tsgo: !process.env.CI,
      },
    },
  ],
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
  // externalize pre-bundled dependencies
  output: {
    externals: {
      'magic-string': '../compiled/magic-string/index.js',
      picocolors: '../compiled/picocolors/index.js',
      tinyglobby: '../compiled/tinyglobby/index.js',
      'tsconfig-paths': 'node-commonjs ../compiled/tsconfig-paths/index.js',
    },
  },
  plugins: [pluginPublint()],
});
