import { type LibConfig, defineConfig } from 'rslib';

const shared: LibConfig = {
  bundle: false,
  source: {
    entry: {
      index: './src/**',
    },
  },
  dts: {
    bundle: false,
  },
};

export default defineConfig({
  lib: [
    {
      ...shared,
      format: 'esm',
      output: {
        distPath: {
          root: './dist/esm',
        },
      },
    },
    {
      ...shared,
      format: 'cjs',
      output: {
        distPath: {
          root: './dist/cjs',
        },
      },
    },
  ],
});
