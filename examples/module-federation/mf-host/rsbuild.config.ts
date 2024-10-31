import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'rsbuild_host',
      remotes: {
        rslib: 'rslib@http://localhost:3001/mf/mf-manifest.json',
      },
      shared: {
        react: {
          singleton: true,
        },
        'react-dom': {
          singleton: true,
        },
      },
      // If rslib module runs "npm run build", this configuration is necessary because React in rslib module is in 'production' mode while host app is in 'development' mode.
      // Reference: https://lib.rsbuild.dev/guide/advanced/module-federation#faqs
      shareStrategy: 'loaded-first',
    }),
  ],
});
