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
          fileName: 'hello-cross',
          seaOptions: {
            assets: {
              message: './assets/message.txt',
            },
          },
          targets: [
            {
              platform: 'linux',
              arch: 'x64',
            },
            {
              platform: 'darwin',
              arch: 'arm64',
            },
            {
              platform: 'win32',
              arch: 'x64',
            },
          ],
        },
      },
    }),
  ],
});
