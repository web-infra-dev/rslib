import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  dev: {
    watchFiles: {
      paths: './test-temp-restart.txt',
      type: 'restart',
    },
  },
  plugins: [
    {
      name: 'test:on-restart',
      setup(api) {
        api.onRestart(() => {
          console.log('onRestart');
        });
      },
    },
  ],
  lib: [generateBundleEsmConfig()],
});
