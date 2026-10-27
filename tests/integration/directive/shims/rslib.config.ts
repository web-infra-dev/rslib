import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: './dist/esm-default',
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      output: {
        minify: false,
        distPath: './dist/esm-no-minify',
      },
    }),
    generateBundleCjsConfig({
      output: {
        distPath: './dist/cjs-default',
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      output: {
        minify: false,
        distPath: './dist/cjs-no-minify',
      },
    }),
  ],
  shims: {
    cjs: {
      'import.meta.url': true,
    },
    esm: {
      require: true,
      __dirname: true,
      __filename: true,
    },
  },
  source: {
    entry: {
      shebang: './src/shebang.ts',
      directive: './src/directive.ts',
    },
  },
  output: {
    target: 'node',
  },
});
