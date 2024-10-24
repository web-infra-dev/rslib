import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';

const shared = {
  bundle: false,
  dts: {
    bundle: false,
  },
};

export default defineConfig({
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
  lib: [
    {
      ...shared,
      format: 'esm',
      output: {
        distPath: {
          root: './dist/esm',
        },
      },
    },
  ],
  plugins: [
    pluginReact({
      swcReactOptions: {
        runtime: 'classic',
      },
    }),
  ],
});
