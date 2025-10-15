import { defineConfig } from '@rslib/core';
import { generateBundleMFConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleMFConfig(
      {
        name: 'test0',
      },
      {
        output: {
          distPath: 'dist-mf0',
        },
      },
    ),
    generateBundleMFConfig(
      {
        name: 'test1',
      },
      {
        output: {
          distPath: 'dist-mf1',
        },
      },
    ),
    generateBundleMFConfig(
      {
        name: 'test2',
      },
      {
        id: 'mf2',
        output: {
          distPath: 'dist-mf2',
        },
      },
    ),
  ],
  server: {
    port: 3007,
  },
});
