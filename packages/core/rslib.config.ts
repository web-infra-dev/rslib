import fs from 'node:fs';
import path from 'node:path';
import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig, type rsbuild, rspack } from 'rslib';
import packageJson from './package.json' with { type: 'json' };

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
      syntax: ['node 18.12.0'],
      experiments: {
        advancedEsm: true,
      },
      dts: {
        bundle: false,
        // Only use tsgo in local dev for faster build, disable it in CI until it's more stable
        tsgo: !process.env.CI,
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
      RSLIB_VERSION: JSON.stringify(packageJson.version),
    },
  },
  // externalize pre-bundled dependencies
  output: {
    externals: {
      picocolors: '../compiled/picocolors/index.js',
      chokidar: '../compiled/chokidar/index.js',
      rslog: '../compiled/rslog/index.js',
      tinyglobby: '../compiled/tinyglobby/index.js',
    },
  },
  tools: {
    rspack: {
      plugins: [new rspack.CircularDependencyRspackPlugin({})],
    },
  },
});
