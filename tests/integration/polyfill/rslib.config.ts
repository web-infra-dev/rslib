import { pluginBabel } from '@rsbuild/plugin-babel';

// import path from 'node:path';
import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: true,
      // plugins: [
      //   pluginBabel({
      //     babelLoaderOptions: {
      //       plugins: [
      //         [require('@babel/plugin-syntax-typescript'), { isTSX: true }],
      //         [require('@babel/plugin-syntax-jsx')],
      //         [
      //           require('babel-plugin-polyfill-corejs3'),
      //           {
      //             method: 'usage-pure',
      //             // targets: options?.targets,
      //           },
      //         ],
      //       ],
      //     },
      //   }),
      // ],
      // syntax: ['chrome >= 50'],
      source: {
        entry: {
          index: './src/index.ts',
        },
      },
      tools: {
        // rspack: (config, { isWebWorker }) => {
        //   const rules = config.module?.rules!;
        //   rules[2]!.resolve!.alias = {
        //     'core-js': path.resolve(require.resolve('core-js-pure'), '..'),
        //   };
        //   rules[3]!.resolve!.alias = {
        //     'core-js': path.resolve(require.resolve('core-js-pure'), '..'),
        //   };
        //   return config;
        // },
      },
      output: {
        // polyfill: 'usage',
        distPath: {
          root: './dist/esm/bundle',
        },
      },
    }),
  ],
});
