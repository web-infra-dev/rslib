import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig } from 'rslib';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: ['es2023'],
      dts: {
        bundle: false,
        // Only use tsgo in local dev for faster build, disable it in CI until it's more stable
        tsgo: !process.env.CI,
      },
      redirect: {
        dts: {
          extension: true,
        },
      },
    },
  ],
  source: {
    entry: {
      index: './src/index.ts',
      dts: './src/dts.ts',
    },
  },
  // externalize pre-bundled dependencies
  output: {
    externals: {
      'tsconfig-paths': 'node-commonjs ../compiled/tsconfig-paths/index.js',
    },
  },
  plugins: [pluginPublint()],
});
