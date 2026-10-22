import { defineConfig } from '@rslib/core';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const dts = {
  typescriptPath: fileURLToPath(import.meta.resolve('typescript7-api')),
  alias: { '@utils': './src/utils.ts' },
};

export default defineConfig({
  lib: [
    {
      id: 'esm',
      format: 'esm',
      bundle: false,
      dts: { ...dts, autoExtension: true, distPath: './dist/types/esm' },
      output: { distPath: './dist/esm' },
    },
    {
      id: 'cjs',
      format: 'cjs',
      bundle: false,
      dts: { ...dts, autoExtension: true, distPath: './dist/types/cjs' },
      output: { distPath: './dist/cjs' },
    },
  ],
  banner: { dts: '// declaration banner' },
  footer: { dts: '// declaration footer' },
  resolve: {
    alias: { '@utils': resolve(import.meta.dirname, 'src/utils.ts') },
  },
});
