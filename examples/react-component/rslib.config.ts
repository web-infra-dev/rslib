import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';

const shared = {
  autoExtension: true,
  dts: {
    bundle: false,
  },
};

export default defineConfig({
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
  source: {
    entry: {
      main: './src/index.tsx',
    },
  },
  output: {
    externals: {
      react: 'react',
      'react/jsx-runtime': 'react/jsx-runtime',
    },
  },
  plugins: [pluginReact()],
});
