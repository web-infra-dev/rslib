import { type Rspack, rspack } from '@rsbuild/core';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { RspackResolver } from '../types';
import {
    computeBundlelessJsEmitPath,
    computeWasmEmitPath,
    computeWasmRequest,
    isPathInDirectory,
} from './path_utils';

const PLUGIN_NAME = 'RslibWasmPreservePlugin';

type WasmPreserveOptions = {
  jsFilename: Rspack.Filename;
  outBase: string;
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
      if (!request.startsWith('.') && !path.isAbsolute(request)) {
        callback(undefined, request);
        return;
      }
      callback(err as Error);
      return;
    }

    if (!isPathInDirectory(sourcePath, options.outBase)) {
      callback(undefined, request);
      return;
    }

    const emitPath = computeWasmEmitPath({
      outBase: options.outBase,
      sourcePath,
    });

    if (typeof options.jsFilename !== 'string') {
      callback(
        new Error(
          'Wasm preserve does not support a function for "output.filename.js".',
        ),
      );
      return;
    }

    const jsEmitPath = computeBundlelessJsEmitPath({
      outBase: options.outBase,
      issuer: contextInfo.issuer,
      jsFilename: options.jsFilename,
    });

    const externalRequest = computeWasmRequest({
      jsEmitPath,
      wasmEmitPath: emitPath,
    });
    
    callback(undefined, externalRequest);
  };

  return external as Rspack.ExternalItem;
};

export class WasmPreservePlugin {
  constructor(private readonly outBase: string) {}

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
              let bytes: Buffer;

              try {
                bytes = await fs.readFile(sourcePath);
              } catch (err) {
                throw new Error(
                  `[rslib:wasm] Failed to read .wasm source ${sourcePath}: ${
                    (err as Error).message
                  }`,
                );
              }

              compilation.emitAsset(emitPath, new sources.RawSource(bytes));
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

      let sourcePath: string | false;
      try {
        sourcePath = resolver.resolveSync({}, issuerContext, userRequest);
      } catch {
        continue;
      }
      if (!sourcePath) continue;
      if (!isPathInDirectory(sourcePath, this.outBase)) {
        continue;
      }

      found.set(
        sourcePath,
        computeWasmEmitPath({
          outBase: this.outBase,
          sourcePath,
        }),
      );
    }

    return found;
  }
}
