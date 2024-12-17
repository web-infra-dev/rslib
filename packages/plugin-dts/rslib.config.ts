import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig } from 'rslib';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      bundle: false,
      syntax: ['node 16'],
      dts: {
        bundle: false,
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
