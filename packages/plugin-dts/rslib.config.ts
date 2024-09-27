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
  output: {
    target: 'node',
  },
});
