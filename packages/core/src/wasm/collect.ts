import { type Rspack, rspack } from '@rsbuild/core';
import { computeEmitDistRelPath } from './path';

export const collectExternalWasmSources = (
  compiler: Rspack.Compiler,
  compilation: Rspack.Compilation,
  outBase: string | undefined,
  preserveToSource: boolean,
  wasmDistDir: string,
): Map<string, string> => {
  const found = new Map<string, string>();
  const { moduleGraph } = compilation;
  const resolver = compiler.resolverFactory.get('normal', {
    dependencyType: 'esm',
  });

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
      outBase,
      preserveToSource,
      sourcePath: resolved,
      wasmDistDir,
    });

    found.set(resolved, emitDistRelPath);
  }
  return found;
};
