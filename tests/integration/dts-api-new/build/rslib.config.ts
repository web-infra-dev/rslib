import { defineConfig } from '@rslib/core';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      dts: {
        build: true,
        tsgo: true,
        typescriptPath: fileURLToPath(import.meta.resolve('typescript7-api')),
      },
    },
  ],
});
