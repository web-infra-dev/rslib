import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'cjs',
      output: {
        distPath: {
          root: './dist/override',
        },
      },
    },
  ],
});
