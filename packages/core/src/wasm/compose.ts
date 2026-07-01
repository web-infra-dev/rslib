import type { EnvironmentConfig, Rspack } from '@rsbuild/core';
import type { Format, Wasm, WasmMode } from '../types';
import { logger } from '../utils/logger';
import { WasmPreserveEmitPlugin } from './emit';
import { createWasmPreserveExternal } from './external';
import {
  PLUGIN_NAME,
  type ResolvedWasmConfig,
  type WasmCompilerContext,
} from './types';

export const resolveWasmConfig = ({
  bundle,
  format,
  wasmConfig,
}: {
  bundle: boolean;
  format: Format;
  wasmConfig?: Wasm;
}): ResolvedWasmConfig => {
  const options = wasmConfig ?? {};
  if (format !== 'esm') {
    return {
      mode: 'compile',
      hasUserWasmMode: Boolean(options.mode),
    };
  }

  const defaultMode: WasmMode = bundle ? 'compile' : 'preserve';
  return {
    mode: options.mode ?? defaultMode,
    hasUserWasmMode: Boolean(options.mode),
  };
};

export const composeWasmConfig = ({
  bundle,
  format,
  mode,
  hasUserWasmMode,
  outBase,
}: {
  bundle: boolean;
  format: Format;
  mode: WasmMode;
  hasUserWasmMode: boolean;
  outBase: string | null;
}): {
  config: EnvironmentConfig;
  bundlelessExternal?: Rspack.ExternalItem;
} => {
  if (format !== 'esm') {
    if (hasUserWasmMode) {
      logger.warn(
        `[${PLUGIN_NAME}] wasm.mode is only effective for "format: 'esm'", but format is "${format}". The option will be ignored.`,
      );
    }
    return { config: {} };
  }

  if (mode === 'compile') {
    return { config: {} };
  }

  const compilerContext: WasmCompilerContext = {};

  // bundle + preserve emits content-hashed assets (the `outBase` is irrelevant
  // since everything collapses into the entry chunk). bundleless + preserve
  // keeps the original source layout and filename next to the emitted JS.
  if (bundle) {
    return {
      config: {
        output: {
          externals: [
            createWasmPreserveExternal({
              compilerContext,
              outBase: null,
              preserveToSource: false,
            }),
          ],
        },
        tools: {
          rspack: {
            plugins: [
              new WasmPreserveEmitPlugin({
                compilerContext,
                outBase: null,
                preserveToSource: false,
              }),
            ],
          },
        },
      },
    };
  }

  return {
    config: {
      tools: {
        rspack: {
          plugins: [
            new WasmPreserveEmitPlugin({
              compilerContext,
              outBase,
              preserveToSource: true,
            }),
          ],
        },
      },
    },
    bundlelessExternal: createWasmPreserveExternal({
      compilerContext,
      outBase,
      preserveToSource: true,
    }),
  };
};
