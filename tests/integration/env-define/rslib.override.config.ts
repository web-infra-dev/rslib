import { defineConfig } from '@rslib/core';
import {
  generateBundleCjsConfig,
  generateBundleEsmConfig,
  generateBundleUmdConfig,
} from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: './dist/override/esm',
      },
      source: {
        define: {
          'import.meta.env.MODE': JSON.stringify('custom-mode'),
        },
      },
    }),
    generateBundleCjsConfig({
      output: {
        distPath: './dist/override/cjs',
      },
      source: {
        define: {
          'import.meta.env.MODE': JSON.stringify('custom-cjs-mode'),
        },
      },
    }),
    generateBundleUmdConfig({
      umdName: 'EnvDefineOverride',
      output: {
        distPath: './dist/override/umd',
      },
    }),
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
