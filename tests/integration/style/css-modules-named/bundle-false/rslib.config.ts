import { pluginSass } from '@rsbuild/plugin-sass';
import { defineConfig } from '@rslib/core';
import { pluginTypedCSSModules } from "@rsbuild/plugin-typed-css-modules";
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({ bundle: false }),
    generateBundleCjsConfig({ bundle: false }),
  ],
  source: {
    entry: {
      index: ['../__fixtures__/basic/src/**'],
    },
  },
  output: {
    target: 'web',
    cssModules: {
      namedExport: true,
      exportLocalsConvention: 'camelCaseOnly',
    },
  },
  plugins: [
    pluginSass({
      sassLoaderOptions: {
        additionalData: '$base-color: #c6538c;',
      },
    }),
    pluginTypedCSSModules()
  ],
});
