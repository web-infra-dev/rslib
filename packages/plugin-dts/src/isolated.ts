import { normalize, resolve } from 'node:path';
import type { Rspack } from '@rsbuild/core';
import { logger, rspack } from '@rsbuild/core';
import {
  bundleDtsIfNeeded,
  type PreparedDtsContext,
  prepareDtsContext,
} from './dts';
import type { DtsGenOptions } from './index';
import { color, processDtsFiles, rewriteDtsExtensions } from './utils';

export type IsolatedDtsContext = Omit<DtsGenOptions, 'dtsExtension'> &
  PreparedDtsContext & {
    dtsExtension: string;
    bundlerConfig: Rspack.Configuration | undefined;
  };

type RslibPluginInstance = {
  _args?: [
    {
      emitDts?: {
        rootDir: string;
        declarationDir: string;
      };
    },
  ];
};

const applyIsolatedDtsOptions = (isolatedDtsContext: IsolatedDtsContext) => {
  const bundlerConfig = isolatedDtsContext.bundlerConfig;
  const RspackRslibPlugin = rspack.experiments.RslibPlugin as new (
    ...args: unknown[]
  ) => unknown;
  const rslibPlugin = bundlerConfig?.plugins?.find(
    (plugin) => plugin instanceof RspackRslibPlugin,
  ) as RslibPluginInstance | undefined;

  if (!rslibPlugin?._args?.[0]) {
    throw new Error(
      'Can not enable "dts.isolated: true" without the built-in RslibPlugin.',
    );
  }

  // Pass fully resolved directories to Rspack so plugin-dts does not need to
  // know anything about output.path or how declaration assets are emitted.
  const emitDts = {
    rootDir: normalize(
      resolve(isolatedDtsContext.cwd, isolatedDtsContext.rootDir),
    ),
    declarationDir: normalize(
      resolve(isolatedDtsContext.cwd, isolatedDtsContext.declarationDir),
    ),
  };

  // Rspack's built-in RslibPlugin stores constructor arguments and reads them
  // before the native compiler is created. Configure emitDts before compilation
  // starts so isolated declarations are emitted by Rspack itself.
  rslibPlugin._args[0].emitDts = emitDts;

  if (rslibPlugin._args[0].emitDts !== emitDts) {
    throw new Error(
      'Failed to configure Rspack isolated declaration emission.',
    );
  }
};

export async function createIsolatedDtsContext(
  dtsGenOptions: DtsGenOptions,
  bundlerConfig: Rspack.Configuration | undefined,
): Promise<IsolatedDtsContext> {
  const isolatedDtsContext = {
    ...dtsGenOptions,
    dtsExtension: dtsGenOptions.dtsExtension ?? '.d.ts',
    bundlerConfig,
    ...(await prepareDtsContext(dtsGenOptions)),
  };

  applyIsolatedDtsOptions(isolatedDtsContext);

  return isolatedDtsContext;
}

export async function processIsolatedDts(
  isolatedDtsContext: IsolatedDtsContext,
  options: {
    logSuccess?: boolean;
  } = {},
): Promise<void> {
  const { logSuccess = true } = options;

  // Rspack always emits `.d.ts`; keep the existing post-process behavior so
  // autoExtension / redirect / alias handling matches the tsc and tsgo paths.
  await rewriteDtsExtensions(
    isolatedDtsContext.cwd,
    isolatedDtsContext.declarationDir,
    isolatedDtsContext.dtsExtension,
    isolatedDtsContext.bundle,
    isolatedDtsContext.tsConfigResult.options.declarationMap,
  );

  await processDtsFiles(
    isolatedDtsContext.bundle,
    isolatedDtsContext.cwd,
    isolatedDtsContext.declarationDir,
    isolatedDtsContext.dtsExtension,
    isolatedDtsContext.redirect ?? {
      path: true,
      extension: false,
    },
    isolatedDtsContext.tsconfigPath,
    isolatedDtsContext.rootDir,
    isolatedDtsContext.paths,
    isolatedDtsContext.banner,
    isolatedDtsContext.footer,
  );

  if (isolatedDtsContext.isWatch || !logSuccess) {
    return;
  }

  if (isolatedDtsContext.bundle) {
    logger.info(
      `declaration files prepared with isolated declaration ${color.dim(`(${isolatedDtsContext.name})`)}`,
    );
    await bundleDtsIfNeeded(isolatedDtsContext, isolatedDtsContext);
  } else {
    logger.ready(
      `declaration files generated with isolated declaration ${color.dim(`(${isolatedDtsContext.name})`)}`,
    );
  }
}
