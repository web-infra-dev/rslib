import type { Rspack } from '@rsbuild/core';
import type { RspackResolver } from '../types';
import { color } from '../utils/color';
import { logger } from '../utils/logger';
import { computeEmitDistRelPath, computeRequestFromIssuer } from './path';

const isPreservableWasmRequest = (
  request: string | undefined,
  dependencyType?: string,
): boolean => {
  if (!request) return false;
  if (!request.endsWith('.wasm')) return false;
  if (dependencyType !== 'esm') return false;
  return true;
};

export const createWasmPreserveExternal = ({
  outBase,
  preserveToSource,
  wasmDistDir,
}: {
  outBase?: string;
  preserveToSource: boolean;
  wasmDistDir: string;
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
      const emitDistRelPath = computeEmitDistRelPath({
        outBase,
        preserveToSource,
        sourcePath: resolved,
        wasmDistDir,
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
        `[rslib:wasm] Failed to externalize ${color.green(`"${request}"`)} from ${color.green(contextInfo.issuer || '<unknown>')}: ${
          (err as Error).message
        }`,
      );
      callback();
    }
  };

  return external as Rspack.ExternalItem;
};
