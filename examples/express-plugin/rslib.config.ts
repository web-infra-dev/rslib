import { defineConfig } from '@rslib/core';

const shared = {
  autoExtension: true,
  dts: {
    bundle: false,
  },
};

export default defineConfig({
  lib: [
    {
      ...shared,
      format: 'esm',
      output: {
        distPath: {
          root: './dist/esm',
        },
      },
    },
    {
      ...shared,
      format: 'cjs',
      output: {
        distPath: {
          root: './dist/cjs',
        },
      },
    },
  ],
  source: {
    entry: {
      main: './src/index.ts',
    },
  },
  output: {
    externals: {
      express: 'express',
    },
    target: 'node',
  },
});
