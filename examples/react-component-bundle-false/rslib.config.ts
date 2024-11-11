import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import { type LibConfig, defineConfig } from '@rslib/core';

const shared: LibConfig = {
  bundle: false,
  dts: {
    bundle: false,
  },
};

export default defineConfig({
  source: {
    entry: {
      index: ['./src/**', '!./src/env.d.ts'],
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
    {
      ...shared,
      format: 'cjs',
      output: {
        distPath: {
          root: './dist/cjs',
        },
      },
    },
  ],
  output: {
    target: 'web',
  },
  plugins: [
    pluginReact({
      swcReactOptions: {
        runtime: 'classic',
      },
    }),
    pluginSass(),
  ],
});
