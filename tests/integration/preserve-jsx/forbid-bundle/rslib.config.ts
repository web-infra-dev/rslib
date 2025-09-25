import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig({})],
  source: {
    entry: {
      index: './src/index.tsx',
    },
  },
  plugins: [
    pluginReact({
      swcReactOptions: {
        runtime: 'preserve',
      },
    }),
  ],
});
