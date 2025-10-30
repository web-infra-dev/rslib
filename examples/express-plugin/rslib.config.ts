import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      dts: true,
      output: {
        distPath: './dist/esm',
      },
      experiments: {
        advancedEsm: true,
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
