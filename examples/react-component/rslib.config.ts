import { pluginModuleFederation } from '@rsbuild/plugin-module-federation';
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
    },
  ],
  plugins: [
    pluginReact({
      splitChunks: {
        react: false,
      },
    }),
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
});
