import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginSolid } from '@rsbuild/plugin-solid';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
  lib: [
    {
      bundle: false,
      dts: true,
      format: 'esm',
      plugins: [
        pluginBabel({
          include: /\.(?:jsx|tsx)$/,
        }),
        pluginSolid(),
      ],
    },
    {
      bundle: false,
      format: 'esm',
      output: {
        distPath: {
          root: './dist/source',
        },
        filename: {
          js: '[name].jsx',
        },
      },
      tools: {
        swc: {
          detectSyntax: 'auto',
          jsc: {
            transform: {
              react: {
                runtime: 'preserve',
              },
            },
          },
        },
        rspack: {
          module: {
            parser: {
              javascript: {
                jsx: true,
              },
            },
          },
        },
      },
    },
  ],
  output: {
    target: 'web',
  },
});
