import { defineConfig, moduleTools } from '@modern-js/module-tools';
import prebundleConfig from './prebundle.config.mjs';

const externals = ['@rsbuild/core', /[\\/]compiled[\\/]/, /node:/];
const define = {
  RSLIB_VERSION: require('./package.json').version,
};

const aliasCompiledPlugin = {
  name: 'alias-compiled-plugin',
  setup(build) {
    const { dependencies } = prebundleConfig;
    for (const item of dependencies) {
      const depName = typeof item === 'string' ? item : item.name;
      build.onResolve({ filter: new RegExp(`^${depName}$`) }, () => ({
        path: `../compiled/${depName}/index.js`,
        external: true,
      }));
    }
  },
};

export default defineConfig({
  plugins: [moduleTools()],
  buildConfig: [
    {
      format: 'cjs',
      target: 'es2020',
      buildType: 'bundle',
      autoExtension: true,
      externals,
      dts: false,
      define,
      esbuildOptions(options) {
        options.plugins?.unshift(aliasCompiledPlugin);
        return options;
      },
    },
    {
      format: 'esm',
      target: 'es2020',
      buildType: 'bundle',
      autoExtension: true,
      externals,
      dts: false,
      define,
      esbuildOptions(options) {
        options.plugins?.unshift(aliasCompiledPlugin);
        return options;
      },
    },
    {
      buildType: 'bundleless',
      dts: {
        distPath: '../dist-types',
        only: true,
      },
    },
  ],
});
