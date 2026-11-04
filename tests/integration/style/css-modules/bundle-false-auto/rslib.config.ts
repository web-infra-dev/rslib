import { pluginSass } from '@rsbuild/plugin-sass';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({ bundle: false }),
    generateBundleCjsConfig({ bundle: false }),
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: './dist/externals/esm',
        // These requests point to emitted CSS files imported by the extract loader.
        externals: {
          './reset.css': './theme.css',
          './index_module.css': './button-theme.css',
        },
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      output: {
        distPath: './dist/externals/cjs',
        // These requests point to emitted CSS files imported by the extract loader.
        externals: {
          './reset.css': './theme.css',
          './index_module.css': './button-theme.css',
        },
      },
    }),
  ],
  source: {
    entry: {
      index: ['../__fixtures__/basic/src/**'],
    },
  },
  plugins: [
    pluginSass({
      sassLoaderOptions: {
        additionalData: '$base-color: #c6538c;',
      },
    }),
  ],
  output: {
    target: 'web',
    cssModules: {
      auto: /\.s?css$/,
    },
  },
});
