import { defineConfig } from '@rslib/core';
import {
  generateBundleCjsConfig,
  generateBundleEsmConfig,
  generateBundleUmdConfig,
} from 'test-helper';

export default defineConfig({
  // Disable cache due to stale modules when switching configs:
  // https://github.com/web-infra-dev/rspack/issues/16587
  performance: {
    buildCache: false,
  },
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
