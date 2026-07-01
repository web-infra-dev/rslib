import { promises as fs } from 'node:fs';
import type { Rspack } from '@rsbuild/core';
import type { RspackResolver } from '../types';
import { color } from '../utils/color';
import { logger } from '../utils/logger';
import {
  computeEmitDistRelPath,
  computeRequestFromIssuer,
} from './path';
import { PLUGIN_NAME, type WasmCompilerContext } from './types';

const isPreservableWasmRequest = (
  request: string | undefined,
  dependencyType?: string,
): boolean => {
  if (!request) return false;
  if (!request.endsWith('.wasm')) return false;
  // Preserve mode only owns direct WASM ESM-Integration imports. In current
  // Rslib builds, `new URL('./x.wasm', import.meta.url)` is filtered earlier by
  // `parser.url = false`, so it should not reach this branch. Keep asset-style
  // `.wasm` requests out of preserve externalization as they belong to resource
  // semantics rather than module semantics.
  if (dependencyType === 'asset') return false;
  return true;
};

export const createWasmPreserveExternal = ({
  compilerContext,
  outBase,
  preserveToSource,
}: {
  compilerContext: WasmCompilerContext;
  outBase: string | null;
  preserveToSource: boolean;
}): Rspack.ExternalItem => {
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
    if (!request || !getResolve || !context || !contextInfo) {
      callback();
      return;
    }
    if (!isPreservableWasmRequest(request, dependencyType)) {
      callback();
      return;
    }
    if (!resolver) {
      resolver = getResolve() as RspackResolver;
    }
    try {
      const resolved = await resolver(context, request);
      const bytes = await fs.readFile(resolved);
      const emitDistRelPath = computeEmitDistRelPath({
        bytes,
        compiler: compilerContext.compiler!,
        compilation: compilerContext.compilation!,
        outBase,
        preserveToSource,
        sourcePath: resolved,
      });

      const issuer = contextInfo.issuer || '';
      const externalRequest = computeRequestFromIssuer(
        issuer,
        outBase,
        emitDistRelPath,
      );
      callback(undefined, externalRequest);
    } catch (err) {
      logger.debug(
        `[${PLUGIN_NAME}] Failed to externalize ${color.green(`"${request}"`)} from ${color.green(contextInfo.issuer || '<unknown>')}: ${
          (err as Error).message
        }`,
      );
      callback();
    }
  };

  return external as Rspack.ExternalItem;
};
