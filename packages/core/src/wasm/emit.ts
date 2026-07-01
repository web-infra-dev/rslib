import { promises as fs } from 'node:fs';
import type { Rspack } from '@rsbuild/core';
import { collectExternalWasmSources } from './collect';
import {
  getAssetEmitPath,
  getWebassemblyModuleFilename,
} from './path';
import {
  PLUGIN_NAME,
  type WasmCompilerContext,
} from './types';

const EMIT_PLUGIN_NAME = 'RslibWasmPreserveEmitPlugin';

export class WasmPreserveEmitPlugin {
  readonly #compilerContext: WasmCompilerContext;
  readonly outBase: string | null;
  readonly preserveToSource: boolean;

  constructor(options: {
    compilerContext: WasmCompilerContext;
    outBase: string | null;
    preserveToSource: boolean;
  }) {
    this.#compilerContext = options.compilerContext;
    this.outBase = options.outBase;
    this.preserveToSource = options.preserveToSource;
  }

  apply(compiler: Rspack.Compiler): void {
    this.#compilerContext.compiler = compiler;
    const { sources, Compilation } = compiler.webpack;
    compiler.hooks.thisCompilation.tap(EMIT_PLUGIN_NAME, (compilation) => {
      this.#compilerContext.compilation = compilation;
      compilation.hooks.processAssets.tapPromise(
        {
          name: EMIT_PLUGIN_NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        async () => {
          // Derive the emit list from the module graph, which is fully
          // available here for both cold and persistent-cache builds.
          const toEmit = await collectExternalWasmSources(
            compiler,
            compilation,
            this.outBase,
            this.preserveToSource,
          );

          await Promise.all(
            Array.from(toEmit, async ([sourcePath, emitPath]) => {
              if (compilation.getAsset(emitPath)) return;
              try {
                const bytes = await fs.readFile(sourcePath);
                const assetInfo =
                  this.outBase && this.preserveToSource
                    ? undefined
                    : getAssetEmitPath({
                        bytes,
                        compiler,
                        compilation,
                        filenameTemplate:
                          getWebassemblyModuleFilename(compilation),
                        sourcePath,
                      }).info;
                compilation.emitAsset(
                  emitPath,
                  new sources.RawSource(bytes),
                  assetInfo,
                );
              } catch (err) {
                compilation.errors.push(
                  new compiler.webpack.WebpackError(
                    `[${PLUGIN_NAME}] Failed to read .wasm source ${sourcePath}: ${
                      (err as Error).message
                    }`,
                  ),
                );
              }
            }),
          );
        },
      );
    });
  }
}
