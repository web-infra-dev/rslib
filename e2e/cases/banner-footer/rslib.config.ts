import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { type LibConfig, defineConfig } from '@rslib/core';

const bannerFooterConfig: LibConfig = {
  banner: {
    js: '/*! hello banner js */',
    css: '/*! hello banner css */',
    dts: '/*! hello banner dts */',
  },
  footer: {
    js: '/*! hello footer js */',
    css: '/*! hello footer css */',
    dts: '/*! hello footer dts */',
  },
};

export default defineConfig({
  lib: [
    // bundle esm
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/esm/bundle',
        },
      },
      dts: {
        bundle: true,
      },
      ...bannerFooterConfig,
    }),
    // bundle cjs
    generateBundleCjsConfig({
      output: {
        distPath: {
          root: './dist/cjs/bundle',
        },
      },
      dts: {
        bundle: true,
      },
      ...bannerFooterConfig,
    }),
    // bundleless esm
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/esm/bundleless',
        },
      },
      bundle: false,
      dts: {
        bundle: false,
      },
      // TODO: bundleless css
      source: {
        entry: {
          index: ['./src/**/*.ts'],
        },
      },
      ...bannerFooterConfig,
    }),
    // bundleless cjs
    generateBundleCjsConfig({
      output: {
        distPath: {
          root: './dist/cjs/bundleless',
        },
      },
      bundle: false,
      dts: {
        bundle: false,
      },
      // TODO: bundleless css
      source: {
        entry: {
          index: ['./src/**/*.ts'],
        },
      },
      ...bannerFooterConfig,
    }),
    // bundle esm with minify enabled
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/esm/bundle-minify',
        },
        minify: true,
      },
      dts: {
        bundle: true,
      },
      ...bannerFooterConfig,
    }),
  ],
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
});
