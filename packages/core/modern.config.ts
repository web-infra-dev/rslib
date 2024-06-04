import { defineConfig, moduleTools } from '@modern-js/module-tools';

export default defineConfig({
  plugins: [moduleTools()],
  buildConfig: [
    {
      input: ['src'],
      buildType: 'bundleless',
      format: 'cjs',
      autoExtension: true,
      target: 'es2020',
      outDir: './dist/lib',
      dts: false,
    },
    {
      input: ['src'],
      buildType: 'bundleless',
      format: 'esm',
      autoExtension: true,
      target: 'es2020',
      dts: false,
      outDir: './dist/es',
    },
    {
      input: ['src'],
      buildType: 'bundleless',
      outDir: './dist/types',
      dts: {
        only: true,
      },
    },
  ],
});
