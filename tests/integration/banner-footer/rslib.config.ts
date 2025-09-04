import { defineConfig, type LibConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

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
      source: {
        entry: {
          index: ['./src/**'],
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
      source: {
        entry: {
          index: ['./src/**'],
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
    // bundle esm
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/esm-tsgo/bundle',
        },
      },
      dts: {
        bundle: true,
        experiments: {
          tsgo: true,
        },
      },
      ...bannerFooterConfig,
    }),
    // bundle cjs
    generateBundleCjsConfig({
      output: {
        distPath: {
          root: './dist/cjs-tsgo/bundle',
        },
      },
      dts: {
        bundle: true,
        experiments: {
          tsgo: true,
        },
      },
      ...bannerFooterConfig,
    }),
    // bundleless esm
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/esm-tsgo/bundleless',
        },
      },
      bundle: false,
      dts: {
        bundle: false,
        experiments: {
          tsgo: true,
        },
      },
      source: {
        entry: {
          index: ['./src/**'],
        },
      },
      ...bannerFooterConfig,
    }),
    // bundleless cjs
    generateBundleCjsConfig({
      output: {
        distPath: {
          root: './dist/cjs-tsgo/bundleless',
        },
      },
      bundle: false,
      dts: {
        bundle: false,
        experiments: {
          tsgo: true,
        },
      },
      source: {
        entry: {
          index: ['./src/**'],
        },
      },
      ...bannerFooterConfig,
    }),
    // bundle esm with minify enabled
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/esm-tsgo/bundle-minify',
        },
        minify: true,
      },
      dts: {
        bundle: true,
        experiments: {
          tsgo: true,
        },
      },
      ...bannerFooterConfig,
    }),
  ],
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
  output: {
    target: 'web',
  },
});
