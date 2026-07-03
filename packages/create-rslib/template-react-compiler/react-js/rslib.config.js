import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
  lib: [
    {
      bundle: false,
    },
  ],
  output: {
    target: 'web',
  },
  plugins: [
    pluginReact({
      reactCompiler: true,
    }),
  ],
});
