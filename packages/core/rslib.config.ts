import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig, rspack } from 'rslib';
import packageJson from './package.json' with { type: 'json' };

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: ['es2023'],
      dts: {
        bundle: false,
        isolated: true,
        distPath: './dist-types',
      },
      redirect: {
        dts: {
          extension: true,
        },
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
