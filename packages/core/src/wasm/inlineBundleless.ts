import { type Rspack, rspack } from '@rsbuild/core';
import { promises as fs } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import type { RspackResolver } from '../types';
import { generateWasmInlineModule } from './inline';
import {
  computeBundlelessJsEmitPath,
  computeWasmRequest,
  isPathInDirectory,
} from './path_utils';

const require = createRequire(import.meta.url);

// Bundleless output cannot bundle the decoder away, so the shared runtime is
// copied into dist as its own file and every wrapper imports it from there.
const resolveRuntimePath = (): string =>
  require.resolve('./wasmInlineRuntime.js');

const PLUGIN_NAME = 'RslibWasmInlineEmitPlugin';
const INLINE_QUERY = /(?:^|&)inline(?:&|=|$)/;

type WasmInlineBundlelessOptions = {
  jsDistPath: string;
  jsFilename: Rspack.Filename;
  outBase: string;
};

const parseInlineWasmRequest = (
  request: string | undefined,
): string | undefined => {
  if (!request) return undefined;
  const queryIndex = request.indexOf('?');
  if (queryIndex === -1) return undefined;
  const resource = request.slice(0, queryIndex);
  const query = request.slice(queryIndex + 1);
  return resource.endsWith('.wasm') && INLINE_QUERY.test(query)
    ? resource
    : undefined;
};

const computeRuntimeEmitPath = (options: WasmInlineBundlelessOptions): string =>
  computeBundlelessJsEmitPath({
    outBase: options.outBase,
    issuer: path.join(options.outBase, 'rslib-wasm-runtime.js'),
    jsDistPath: options.jsDistPath,
    jsFilename: options.jsFilename as string,
  });

/**
 * Collects every `.wasm?inline` import from the module graph.
 *
 * This deliberately reads the module graph instead of recording what the
 * external callback saw: Rspack restores the module graph from its persistent
 * cache but does not replay the external callback, so anything accumulated
 * there would be missing on a cached rebuild.
 *
 * The request is resolved through the compilation's own resolver rather than
 * joined onto the issuer directory, so aliases, `resolve.extensions` and
 * symlinks behave the same as they do in the external callback and in bundle
 * mode. Resolving here rather than remembering what the callback resolved
 * keeps the two sides free of shared state.
 */
const collectInlineWasmSources = (
  compilation: Rspack.Compilation,
): Set<string> => {
  const sources = new Set<string>();
  const resolver = compilation.resolverFactory.get('normal', {
    dependencyType: 'esm',
  });

  for (const module of compilation.modules) {
    if (!module.identifier().startsWith('external module ')) continue;

    const resourceRequest = parseInlineWasmRequest(
      (module as { userRequest?: string }).userRequest,
    );
    if (!resourceRequest) continue;

    const issuerContext = compilation.moduleGraph.getIssuer(module)?.context;
    if (!issuerContext) continue;

    const sourcePath = resolver.resolveSync({}, issuerContext, resourceRequest);
    if (sourcePath) sources.add(sourcePath);
  }

  return sources;
};

export const createWasmInlineBundleless = (
  options: WasmInlineBundlelessOptions,
): {
  external: Rspack.ExternalItem;
  plugin: Rspack.RspackPluginInstance;
} => {
  // The external callback only decides how the request is rewritten. Generating
  // the wrapper and the shared runtime both happen in the emit phase below,
  // which runs on cached and uncached builds alike.
  let resolver: RspackResolver | undefined;

  const external = async (
    data: Rspack.ExternalItemFunctionData,
    callback: (
      err?: Error,
      result?: Rspack.ExternalItemValue,
      type?: Rspack.ExternalsType,
    ) => void,
  ): Promise<void> => {
    const resourceRequest = parseInlineWasmRequest(data.request);
    if (!resourceRequest || data.dependencyType !== 'esm') {
      callback();
      return;
    }

    const { context, contextInfo, getResolve } = data;
    if (!getResolve || !context || !contextInfo?.issuer) {
      callback();
      return;
    }
    // Mirrors the same guard in `preserve.ts`: `composeWasmConfig` is typed with
    // the wide `Rspack.Filename`, though config.ts only ever passes the string
    // template through.
    if (typeof options.jsFilename !== 'string') {
      callback(
        new Error(
          'Wasm inline does not support a function for "output.filename.js" in bundleless mode.',
        ),
      );
      return;
    }

    resolver ??= getResolve() as RspackResolver;

    let sourcePath: string;
    try {
      sourcePath = await resolver(context, resourceRequest);
    } catch (error) {
      callback(error as Error);
      return;
    }

    if (!isPathInDirectory(sourcePath, options.outBase)) {
      callback(
        new Error(
          `Bundleless wasm inline imports must resolve inside outBase: ${data.request}`,
        ),
      );
      return;
    }

    const issuerEmitPath = computeBundlelessJsEmitPath({
      outBase: options.outBase,
      issuer: contextInfo.issuer,
      jsDistPath: options.jsDistPath,
      jsFilename: options.jsFilename,
    });
    const jsEmitPath = computeBundlelessJsEmitPath({
      outBase: options.outBase,
      issuer: sourcePath,
      jsDistPath: options.jsDistPath,
      jsFilename: options.jsFilename,
    });

    callback(
      undefined,
      computeWasmRequest({
        jsEmitPath: issuerEmitPath,
        wasmEmitPath: jsEmitPath,
      }),
    );
  };

  return {
    external: external as Rspack.ExternalItem,
    plugin: new (class implements Rspack.RspackPluginInstance {
      apply(compiler: Rspack.Compiler): void {
        const { Compilation, sources } = rspack;
        compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
          compilation.hooks.processAssets.tapPromise(
            {
              name: PLUGIN_NAME,
              stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
            },
            async () => {
              const sourcePaths = collectInlineWasmSources(compilation);
              if (sourcePaths.size === 0) return;

              const runtimeEmitPath = computeRuntimeEmitPath(options);
              compilation.emitAsset(
                runtimeEmitPath,
                new sources.RawSource(
                  await fs.readFile(resolveRuntimePath(), 'utf8'),
                ),
              );

              await Promise.all(
                [...sourcePaths].map(async (sourcePath) => {
                  const jsEmitPath = computeBundlelessJsEmitPath({
                    outBase: options.outBase,
                    issuer: sourcePath,
                    jsDistPath: options.jsDistPath,
                    jsFilename: options.jsFilename as string,
                  });

                  try {
                    const bytes = await fs.readFile(sourcePath);
                    const code = generateWasmInlineModule({
                      bytes,
                      runtimeRequest: computeWasmRequest({
                        jsEmitPath,
                        wasmEmitPath: runtimeEmitPath,
                      }),
                    });

                    compilation.fileDependencies.add(sourcePath);
                    compilation.emitAsset(
                      jsEmitPath,
                      new sources.RawSource(code),
                    );
                  } catch (error) {
                    const message =
                      error instanceof Error ? error.message : String(error);
                    compilation.errors.push(
                      new rspack.WebpackError(
                        `Failed to inline ${sourcePath}: ${message}`,
                      ),
                    );
                  }
                }),
              );
            },
          );
        });
      }
    })(),
  };
};
