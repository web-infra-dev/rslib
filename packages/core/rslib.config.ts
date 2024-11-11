import { defineConfig } from 'rslib';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: ['node 16'],
      dts: {
        bundle: false,
        distPath: './dist-types',
      },
    },
  ],
  source: {
    entry: {
      index: './src/index.ts',
      libCssExtractLoader: './src/css/libCssExtractLoader.ts',
    },
    define: {
      RSLIB_VERSION: JSON.stringify(require('./package.json').version),
    },
  },
  output: {
    externals: {
      picocolors: '../compiled/picocolors/index.js',
      commander: '../compiled/commander/index.js',
      rslog: '../compiled/rslog/index.js',
    },
  },
});
