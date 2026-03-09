import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: true,
      output: {
        distPath: 'dist/bundle',
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: 'dist/bundle-false',
      },
      plugins: [
        pluginReact({
          swcReactOptions: {
            runtime: 'preserve',
          },
        }),
      ],
    }),
  ],
});
