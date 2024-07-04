import { join } from 'node:path';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from '#shared';

export default defineConfig({
  lib: [
    generateBundleEsmConfig(__dirname, { platform: 'node' }),
    generateBundleCjsConfig(__dirname, { platform: 'node' }),
  ],
  source: {
    entry: {
      main: join(__dirname, 'src/index.ts'),
    },
  },
  output: {
    externals: { react: 'react' },
  },
});
