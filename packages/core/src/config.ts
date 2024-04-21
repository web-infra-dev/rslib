import {
  type CreateRsbuildOptions,
  defineConfig as defineRsbuildConfig,
} from '@rsbuild/core'
import type { RslibConfig } from './types'

export function composeCreateRsbuildConfig(
  rslibConfig: RslibConfig,
): CreateRsbuildOptions {
  const { root, entry, outDir } = rslibConfig

  const rsbuildConfig = defineRsbuildConfig({
    source: {
      entry: {
        main: entry,
      },
    },
    tools: {
      htmlPlugin: false,
      rspack: {
        output: {
          module: true,
          library: {
            type: 'module',
          },
        },
        optimization: {
          concatenateModules: true,
        },
        experiments: {
          outputModule: true,
        },
      },
    },
    output: {
      filenameHash: false,
      minify: false,
      distPath: {
        root: outDir ?? './dist',
        js: './',
      },
    },
  })

  return {
    cwd: root ?? process.cwd(),
    rsbuildConfig,
  }
}
