import { defineConfig } from '@rslib/core';
import {
  generateBundleCjsConfig,
  generateBundleEsmConfig,
  generateBundleUmdConfig,
} from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      source: {
        define: {
          'import.meta.env.MODE': JSON.stringify('custom-mode'),
        },
      },
    }),
    generateBundleCjsConfig({
      source: {
        define: {
          'import.meta.env.MODE': JSON.stringify('custom-cjs-mode'),
        },
      },
    }),
    generateBundleUmdConfig({ umdName: 'EnvDefineOverride' }),
  ],
  source: {
    define: {
      'process.env.BASE_URL': JSON.stringify('/custom/'),
    },
    entry: {
      index: './src/index.ts',
    },
  },
  output: {
    target: 'web',
  },
});
