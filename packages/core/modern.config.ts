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
    },
  ],
});
