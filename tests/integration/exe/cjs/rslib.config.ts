import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleCjsConfig({
      output: {
        distPath: './dist',
      },
      experiments: {
        exe: {
          fileName: 'hello-cjs',
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
