import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginSolid } from '@rsbuild/plugin-solid';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      id: 'compiled',
      bundle: false,
      dts: true,
      plugins: [
        pluginBabel({
          include: /\.(?:jsx|tsx)$/,
        }),
        pluginSolid(),
      ],
    },
    {
      id: 'source',
      bundle: false,
      output: {
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
