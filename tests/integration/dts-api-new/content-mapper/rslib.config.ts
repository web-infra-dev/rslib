import { defineConfig } from '@rslib/core';
import { fileURLToPath } from 'node:url';

const typescriptPath = fileURLToPath(import.meta.resolve('typescript7-api'));

export default defineConfig({
  source: { entry: { index: './src/index.ts' } },
  lib: [
    {
      id: 'api',
      format: 'esm',
      bundle: false,
      dts: { typescriptPath, distPath: './dist/api' },
      output: { distPath: './dist/api' },
    },
    {
      id: 'bundle',
      format: 'esm',
      bundle: false,
      dts: { typescriptPath, distPath: './dist/bundle', bundle: true },
      output: { distPath: './dist/bundle' },
    },
    {
      id: 'executable',
      format: 'esm',
      bundle: false,
      dts: { typescriptPath, distPath: './dist/executable', build: true },
      output: { distPath: './dist/executable' },
    },
  ],
  banner: { dts: '// mapper banner' },
  footer: { dts: '// mapper footer' },
});
