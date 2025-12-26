import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      dts: true,
      output: {
        distPath: './dist/esm',
      },
    },
    {
      format: 'cjs',
      dts: true,
      output: {
        distPath: './dist/cjs',
      },
    },
  ],
});
