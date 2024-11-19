import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      dts: true,
      output: {
        distPath: {
          root: './dist/esm',
        },
      },
    },
    {
      format: 'cjs',
      dts: true,
      output: {
        distPath: {
          root: './dist/cjs',
        },
      },
    },
    {
      format: 'mf',
      dts: true,
      output: {
        distPath: {
          root: './dist/mf',
        },
        assetPrefix: 'http://localhost:3001/mf',
      },
      dev: {
        assetPrefix: 'http://localhost:3001/mf',
      },
      // just for dev
      server: {
        port: 3001,
      },
      plugins: [
        pluginModuleFederation({
          name: 'rslib_provider',
          exposes: {
            '.': './src/index.tsx',
          },
          shared: {
            react: {
              singleton: true,
            },
            'react-dom': {
              singleton: true,
            },
          },
        }),
      ],
    },
  ],
  plugins: [pluginReact()],
});
