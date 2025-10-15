import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

const assetSourceRules = [
  {
    test: /\.txt$/i,
    type: 'asset/source',
  },
];

export default defineConfig({
  lib: [
    // 0. bundle
    // esm
    generateBundleEsmConfig({
      tools: {
        rspack(_config, { addRules }) {
          addRules(assetSourceRules);
        },
      },
      output: {
        distPath: './dist/esm/bundle',
      },
    }),
    // 1. bundleless
    // esm
    generateBundleEsmConfig({
      bundle: false,
      tools: {
        rspack(_config, { addRules }) {
          addRules(assetSourceRules);
        },
      },
      output: {
        distPath: './dist/esm/bundleless',
      },
    }),
  ],
  output: {
    target: 'web',
  },
});
