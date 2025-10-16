import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      bundle: false,
      source: {
        entry: {
          index: './src/*',
        },
      },
      format: 'cjs',
      output: {
        distPath: './dist/override',
      },
    },
  ],
});
