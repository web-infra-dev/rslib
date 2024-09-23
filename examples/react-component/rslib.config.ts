import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';

const shared = {
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
    {
      ...shared,
      format: 'mf',
      output: {
        distPath: {
          root: './dist/mf',
        },
        assetPrefix: 'http://localhost:3001/mf',
        minify: false,
      },
      source: {
        define: {
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        },
      },
      tools: {
        rspack: {
          plugins: [
            new ModuleFederationPlugin({
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
              // getPublicPath: `return 'http://localhost:3001/mf/'`,
            }),
          ],
          externals: undefined,
        },
      },
    },
  ],
  plugins: [
    pluginReact({
      splitChunks: {
        react: false,
      },
    }),
  ],
});
