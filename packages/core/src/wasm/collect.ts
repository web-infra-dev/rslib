import { promises as fs } from 'node:fs';
import { type Rspack, rspack } from '@rsbuild/core';
import { computeEmitDistRelPath } from './path';

/**
 * Build the preserved `.wasm` emit list from the module graph.
 *
 * Walks `compilation.modules` for preserved `ExternalModule` entries whose
 * `userRequest` ends with `.wasm`, resolves each request using rspack's
 * resolver (so aliases and tsconfig paths work correctly), computes the emit
 * path, and returns a map of source path to emit path.
 */
export const collectExternalWasmSources = async (
  compiler: Rspack.Compiler,
  compilation: Rspack.Compilation,
  outBase: string | null,
  preserveToSource: boolean,
): Promise<Map<string, string>> => {
  const found = new Map<string, string>();
  const { moduleGraph } = compilation;
  const resolver = compiler.resolverFactory.get('normal', { dependencyType: 'esm' });

  for (const module of compilation.modules) {
    if (!(module instanceof rspack.ExternalModule)) continue;
    const { userRequest } = module;
    if (!userRequest || !userRequest.endsWith('.wasm')) continue;
    const issuer = moduleGraph.getIssuer(module);
    const issuerContext = (issuer as { context?: string } | null)?.context;
    if (!issuerContext) continue;

    const resolved = resolver.resolveSync({}, issuerContext, userRequest);
    if (!resolved) continue;

    const emitDistRelPath = computeEmitDistRelPath({
      bytes: await fs.readFile(resolved),
      compiler,
      compilation,
      outBase,
      preserveToSource,
      sourcePath: resolved,
    });

    found.set(resolved, emitDistRelPath);
  }
  return found;
};
