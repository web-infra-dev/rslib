import { defineConfig } from 'rslib';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      bundle: false,
      output: {
        syntax: ['node 16'],
      },
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
