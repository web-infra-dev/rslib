import { promises as fs } from 'node:fs';
import type { Rspack } from '@rsbuild/core';
import { collectExternalWasmSources } from './collect';

const EMIT_PLUGIN_NAME = 'RslibWasmPreserveEmitPlugin';

export class WasmPreserveEmitPlugin {
  readonly outBase: string | undefined;
  readonly preserveToSource: boolean;
  readonly wasmDistDir: string;

  constructor(options: {
    outBase?: string;
    preserveToSource: boolean;
    wasmDistDir: string;
  }) {
    this.outBase = options.outBase;
    this.preserveToSource = options.preserveToSource;
    this.wasmDistDir = options.wasmDistDir;
  }

  apply(compiler: Rspack.Compiler): void {
    const { sources, Compilation } = compiler.webpack;
    compiler.hooks.thisCompilation.tap(EMIT_PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: EMIT_PLUGIN_NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        async () => {
          const toEmit = collectExternalWasmSources(
            compiler,
            compilation,
            this.outBase,
            this.preserveToSource,
            this.wasmDistDir,
          );

          await Promise.all(
            Array.from(toEmit, async ([sourcePath, emitPath]) => {
              try {
                const bytes = await fs.readFile(sourcePath);
                // Duplicate emits with equal content are merged by Rspack;
                // conflicting content triggers Rspack's duplicate asset error.
                compilation.emitAsset(emitPath, new sources.RawSource(bytes));
              } catch (err) {
                compilation.errors.push(
                  new compiler.webpack.WebpackError(
                    `[rslib:wasm] Failed to read .wasm source ${sourcePath}: ${
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
