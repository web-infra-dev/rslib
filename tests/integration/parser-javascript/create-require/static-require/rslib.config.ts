import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

const createRequireDisabled = {
  tools: {
    rspack: {
      module: {
        parser: {
          javascript: {
            createRequire: false,
          },
        },
      },
    },
  },
};

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: './dist/enabled/esm',
      },
    }),
    generateBundleCjsConfig({
      output: {
        distPath: './dist/enabled/cjs',
      },
    }),
    generateBundleEsmConfig({
      ...createRequireDisabled,
      output: {
        distPath: './dist/disabled/esm',
      },
    }),
    generateBundleCjsConfig({
      ...createRequireDisabled,
      output: {
        distPath: './dist/disabled/cjs',
      },
    }),
  ],
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
});
