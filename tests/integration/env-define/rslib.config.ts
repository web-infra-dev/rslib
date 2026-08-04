import { defineConfig } from '@rslib/core';
import {
  generateBundleCjsConfig,
  generateBundleEsmConfig,
  generateBundleUmdConfig,
} from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig(),
    generateBundleCjsConfig(),
    generateBundleUmdConfig({ umdName: 'EnvDefine' }),
  ],
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
  output: {
    target: 'web',
  },
});
