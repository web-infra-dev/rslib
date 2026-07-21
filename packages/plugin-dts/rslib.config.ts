import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig } from 'rslib';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: ['es2023'],
      dts: {
        bundle: false,
        isolated: true,
      },
      redirect: {
        dts: {
          extension: true,
        },
      },
      shims: {
        esm: {
          require: true,
        },
      },
    },
  ],
  source: {
    entry: {
      index: './src/index.ts',
      dts: './src/dts.ts',
    },
  },
  tools: {
    rspack: {
      resolve: {
        alias: {
          // Ensure tsconfig-paths resolves json5 to its CommonJS entry.
          json5$: 'json5/lib/index.js',
        },
      },
    },
  },
  plugins: [pluginPublint()],
});
