import { type Rspack, rspack } from '@rsbuild/core';
import { promises as fs } from 'node:fs';
import type { RspackResolver } from '../types';
import { computeWasmEmitPath, computeWasmRequest } from './path';

const PLUGIN_NAME = 'RslibWasmPreservePlugin';

export type WasmPreserveOptions = {
  bundle: boolean;
  outBase: string | null;
  wasmDistDir: string;
};

export const createWasmPreserveExternal = (
  options: WasmPreserveOptions,
): Rspack.ExternalItem => {
  let resolver: RspackResolver | undefined;

  const external = async (
    data: Rspack.ExternalItemFunctionData,
    callback: (
      err?: Error,
      result?: Rspack.ExternalItemValue,
      type?: Rspack.ExternalsType,
    ) => void,
  ): Promise<void> => {
    const { request, getResolve, context, contextInfo, dependencyType } = data;

    if (!request?.endsWith('.wasm') || dependencyType !== 'esm') {
      callback();
      return;
    }

    if (!getResolve || !context || !contextInfo) {
      callback();
      return;
    }

    resolver ??= getResolve() as RspackResolver;

    let sourcePath: string;
    try {
      sourcePath = await resolver(context, request);
    } catch (err) {
      callback(err as Error);
      return;
    }

    const emitPath = computeWasmEmitPath({
      ...options,
      sourcePath,
    });
    const externalRequest = computeWasmRequest({
      ...options,
      issuer: contextInfo.issuer || '',
      emitPath,
    });
    callback(undefined, externalRequest);
  };

  return external as Rspack.ExternalItem;
};

export class WasmPreservePlugin {
  constructor(private readonly options: WasmPreserveOptions) {}

  apply(compiler: Rspack.Compiler): void {
    const { sources, Compilation } = compiler.webpack;
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: PLUGIN_NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        async () => {
          const toEmit = this.collectExternalWasmSources(compiler, compilation);

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

  private collectExternalWasmSources(
    compiler: Rspack.Compiler,
    compilation: Rspack.Compilation,
  ): Map<string, string> {
    const found = new Map<string, string>();
    const { moduleGraph } = compilation;
    const resolver = compiler.resolverFactory.get('normal', {
      dependencyType: 'esm',
    });

    for (const module of compilation.modules) {
      if (!(module instanceof rspack.ExternalModule)) continue;
      const { userRequest } = module;
      if (!userRequest?.endsWith('.wasm')) continue;

      const issuer = moduleGraph.getIssuer(module);
      const issuerContext = (issuer as { context?: string } | null)?.context;
      if (!issuerContext) continue;

      const sourcePath = resolver.resolveSync({}, issuerContext, userRequest);
      if (!sourcePath) continue;

      found.set(
        sourcePath,
        computeWasmEmitPath({ ...this.options, sourcePath }),
      );
    }

    return found;
  }
}
