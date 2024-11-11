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
      // Enable this when the output of Rslib is build under 'production' mode, while the host app is 'development'.
      // Reference: https://lib.rsbuild.dev/guide/advanced/module-federation#faqs
      shareStrategy: 'loaded-first',
    }),
  ],
});
