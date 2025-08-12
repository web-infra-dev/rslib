import fs from 'node:fs';
import path from 'node:path';
import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig, type rsbuild, rspack } from 'rslib';

const pluginFixDtsTypes: rsbuild.RsbuildPlugin = {
  name: 'fix-dts-types',
  setup(api) {
    api.onAfterBuild(() => {
      const typesDir = path.join(process.cwd(), 'dist-types');
      const pkgPath = path.join(typesDir, 'package.json');
      if (!fs.existsSync(typesDir)) {
        fs.mkdirSync(typesDir);
      }
      fs.writeFileSync(
        pkgPath,
        JSON.stringify({
          '//': 'This file is for making TypeScript work with moduleResolution node16+.',
          version: '1.0.0',
        }),
        'utf8',
      );
    });
  },
};

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es2022',
      dts: {
        bundle: false,
        distPath: './dist-types',
      },
    },
  ],
  plugins: [pluginFixDtsTypes, pluginPublint()],
  source: {
    entry: {
      index: './src/index.ts',
      libCssExtractLoader: './src/css/libCssExtractLoader.ts',
      entryModuleLoader: './src/plugins/entryModuleLoader.ts',
    },
    define: {
      RSLIB_VERSION: JSON.stringify(require('./package.json').version),
    },
  },
  output: {
    externals: {
      picocolors: '../compiled/picocolors/index.js',
      chokidar: '../compiled/chokidar/index.js',
      rslog: '../compiled/rslog/index.js',
    },
  },
  tools: {
    rspack: {
      plugins: [new rspack.CircularDependencyRspackPlugin({})],
    },
  },
});
