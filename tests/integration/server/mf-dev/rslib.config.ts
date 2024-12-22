import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'mf',
    },
  ],
  server: {
    port: 3001,
    open: true,
  },
  plugins: [
    pluginModuleFederation({
      name: 'test',
    }),
  ],
});
