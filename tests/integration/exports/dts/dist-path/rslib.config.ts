import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig({ dts: { distPath: './dist/types' } })],
  source: {
    entry: {
      index: '../../__fixtures__/src/index.ts',
    },
    tsconfigPath: '../../__fixtures__/tsconfig.json',
  },
});
