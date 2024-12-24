import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'mf',
      output: {
        distPath: {
          root: 'dist-mf0',
        },
      },
    },
    {
      format: 'mf',
      output: {
        distPath: {
          root: 'dist-mf1',
        },
      },
    },
    {
      id: 'mf2',
      format: 'mf',
      output: {
        distPath: {
          root: 'dist-mf2',
        },
      },
    },
  ],
  server: {
    port: 3007,
  },
  plugins: [
    pluginModuleFederation({
      name: 'test',
    }),
  ],
});
