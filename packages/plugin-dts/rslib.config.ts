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
        tsgo: true,
      },
    },
  ],
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
  plugins: [pluginPublint()],
});
