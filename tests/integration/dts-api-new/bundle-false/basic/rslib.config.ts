import { defineConfig } from '@rslib/core';
import { fileURLToPath } from 'node:url';

const dts = {
  typescriptPath: fileURLToPath(import.meta.resolve('typescript7-api')),
};

export default defineConfig({
  lib: [
    {
      id: 'esm',
      format: 'esm',
      bundle: false,
      dts,
      output: { distPath: './dist/esm' },
    },
    {
      id: 'cjs',
      format: 'cjs',
      bundle: false,
      dts,
      output: { distPath: './dist/cjs' },
    },
  ],
});
