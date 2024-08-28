import { generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        copy: [
          /**
           * copy file to file
           */
          {
            from: './temp-1/a.png',
            to: 'temp-1/b.png',
          },
          /**
           * copy file to dir
           */
          {
            from: './temp-2/a.png',
            to: 'temp-2',
          },
          /**
           * copy dir to dir
           */
          {
            from: './temp-3/',
            to: 'temp-3',
          },
          /**
           * copy dir to file
           */
          {
            from: './temp-4/',
            to: 'temp-4/_index.html',
          },
          /**
           * copy glob to dir
           */
          {
            from: './*.html',
            context: 'temp-4',
            to: 'temp-5',
          },
          /**
           * copy glob to file
           */
          {
            from: './temp-4/*.html',
            to: 'temp-6/index.html',
          },
        ],
      },
    }),
  ],
});
