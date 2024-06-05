import { defineConfig, moduleTools } from '@modern-js/module-tools';

export default defineConfig({
  plugins: [moduleTools()],
  buildConfig: [
    {
      format: 'cjs',
      target: 'es2020',
      buildType: 'bundle',
      autoExtension: true,
      dts: false,
    },
    {
      format: 'esm',
      target: 'es2020',
      buildType: 'bundle',
      autoExtension: true,
      dts: false,
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
