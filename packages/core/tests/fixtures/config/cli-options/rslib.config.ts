import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      bundle: true,
      source: {
        entry: {
          index: './src/index.ts',
        },
      },
      output: {
        distPath: './dist',
        externals: ['lodash'],
        minify: false,
        cleanDistPath: 'auto',
        target: 'web',
      },
      autoExtension: true,
      autoExternal: true,
      dts: false,
      syntax: 'esnext',
    },
  ],
});
