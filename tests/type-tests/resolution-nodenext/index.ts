// This folder disables `skipLibCheck` to check the public types of @rslib/core
import '@rslib/core/types';
import { createRslib, defineConfig } from '@rslib/core';

createRslib({});

defineConfig({ lib: [] });

defineConfig({
  lib: [{}],
  bundle: false,
  autoExtension: false,
  autoExternal: false,
  redirect: {
    js: {
      extension: false,
    },
  },
  syntax: 'es2020',
  externalHelpers: true,
  banner: {
    js: '/* banner */',
  },
  footer: {
    js: '/* footer */',
  },
  shims: {
    esm: {
      require: true,
    },
  },
  outBase: 'src',
});

defineConfig({
  lib: [{}],
  // @ts-expect-error format is only supported in lib items.
  format: 'cjs',
});

defineConfig({
  lib: [{}],
  // @ts-expect-error dts is only supported in lib items.
  dts: true,
});

defineConfig({
  lib: [{}],
  // @ts-expect-error id is only supported in lib items.
  id: 'esm',
});

defineConfig({
  lib: [{}],
  // @ts-expect-error umdName is only supported in lib items.
  umdName: 'MyLib',
});

defineConfig({
  lib: [{}],
  // @ts-expect-error experiments is only supported in lib items.
  experiments: {},
});

defineConfig({});

defineConfig({
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
});
