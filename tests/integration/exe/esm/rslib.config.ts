import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: './dist',
      },
      experiments: {
        exe: {
          fileName: 'hello-esm',
          seaOptions: {
            assets: {
              message: './assets/message.txt',
            },
          },
        },
      },
    }),
  ],
});
