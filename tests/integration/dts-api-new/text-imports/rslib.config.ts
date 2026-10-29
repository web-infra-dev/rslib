import { defineConfig } from '@rslib/core';
import { fileURLToPath } from 'node:url';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

const dts = {
  abortOnError: true,
  typescriptPath: fileURLToPath(import.meta.resolve('typescript7-api')),
};

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      dts: { ...dts, bundle: true },
      output: { distPath: './dist/esm-bundle' },
    }),
    generateBundleCjsConfig({
      dts: { ...dts, bundle: true },
      output: { distPath: './dist/cjs-bundle' },
    }),
    generateBundleEsmConfig({
      dts: { ...dts, bundle: false },
      output: { distPath: './dist/esm-bundleless' },
    }),
    generateBundleCjsConfig({
      dts: { ...dts, bundle: false },
      output: { distPath: './dist/cjs-bundleless' },
    }),
  ],
});
