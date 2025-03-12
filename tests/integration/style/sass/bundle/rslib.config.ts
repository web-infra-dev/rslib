import { pluginSass } from '@rsbuild/plugin-sass';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig(), generateBundleCjsConfig()],
  source: {
    entry: {
      index: ['../__fixtures__/src/index.scss'],
    },
  },
  plugins: [
    pluginSass({
      sassLoaderOptions: {
        additionalData(content, loaderContext) {
          const contentStr =
            typeof content === 'string' ? content : content.toString();

          if (loaderContext.resourcePath.endsWith('.scss')) {
            return `$base-color: #c6538c;${contentStr}`;
          }
          return contentStr;
        },
      },
    }),
  ],
  output: {
    target: 'web',
  },
});
