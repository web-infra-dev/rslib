import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'esnext',
    },
    {
      format: 'cjs',
      syntax: 'esnext',
    },
  ],
});
