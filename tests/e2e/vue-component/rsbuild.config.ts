import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';

export default defineConfig({
  environments: {
    bundle: {
      source: {
        entry: {
          index: './src/bundle.ts',
        },
      },
    },
    bundleFalse: {
      source: {
        entry: {
          index: './src/bundleFalse.ts',
        },
      },
    },
  },
  output: {
    target: 'web',
  },
  plugins: [pluginVue()],
});
