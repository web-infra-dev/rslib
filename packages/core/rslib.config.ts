import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig, rspack } from 'rslib';
import packageJson from './package.json' with { type: 'json' };

export default defineConfig({
  lib: [
    {
      dts: {
        isolated: true,
        distPath: './dist-types',
      },
    },
  ],
  plugins: [pluginPublint()],
  source: {
    entry: {
      index: './src/index.ts',
      libCssExtractLoader: './src/css/libCssExtractLoader.ts',
    },
    define: {
      RSLIB_VERSION: JSON.stringify(packageJson.version),
    },
  },
  tools: {
    rspack: {
      plugins: [new rspack.CircularCheckRspackPlugin()],
    },
  },
});
