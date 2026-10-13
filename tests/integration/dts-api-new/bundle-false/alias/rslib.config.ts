import { fileURLToPath } from 'node:url';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      dts: {
        bundle: false,
        alias: {
          'prebundle-pkg': './compile/prebundle-pkg',
        },
        tsgo: true,
        typescriptPath: fileURLToPath(import.meta.resolve('typescript7-api')),
      },
    }),
    generateBundleCjsConfig({
      dts: {
        bundle: false,
        alias: {
          'prebundle-pkg': './compile/prebundle-pkg',
        },
        tsgo: true,
        typescriptPath: fileURLToPath(import.meta.resolve('typescript7-api')),
      },
    }),
  ],
});
