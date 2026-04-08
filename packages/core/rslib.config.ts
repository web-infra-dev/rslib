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
        // alias to pre-bundled types as they are public API
        alias: {
          rslog: './compiled/rslog',
        },
        // Only use tsgo in local dev for faster build, disable it in CI until it's more stable
        tsgo: !process.env.CI,
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
      plugins: [new rspack.CircularDependencyRspackPlugin({})],
    },
  },
});
