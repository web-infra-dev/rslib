import { defineConfig, moduleTools } from '@modern-js/module-tools';

const externals = ['@rsbuild/core', /[\\/]compiled[\\/]/, /node:/];
const define = {
  RSLIB_VERSION: require('../core/package.json').version,
};

export default defineConfig({
  plugins: [moduleTools()],
  buildConfig: [
    {
      format: 'cjs',
      target: 'es2020',
      buildType: 'bundleless',
      autoExtension: true,
      externals,
      dts: false,
      shims: true,
      define,
    },
    {
      format: 'esm',
      target: 'es2020',
      buildType: 'bundleless',
      autoExtension: true,
      externals,
      dts: false,
      shims: true,
      define,
    },
    {
      buildType: 'bundleless',
      dts: {
        only: true,
      },
    },
  ],
});
