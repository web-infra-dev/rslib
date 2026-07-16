import type { EnvironmentConfig } from '@rsbuild/core';
import type { Format, Wasm, WasmMode } from '../types';
import { WasmPreserveEmitPlugin } from './emit';
import { createWasmPreserveExternal } from './external';

export const resolveWasmMode = ({
  bundle,
  format,
  wasmConfig,
}: {
  bundle: boolean;
  format: Format;
  wasmConfig?: Wasm;
}): WasmMode => {
  if (wasmConfig !== undefined && format !== 'esm') {
    throw new Error(
      'When using "wasm", "format" must be set to "esm". Since the default value for "format" is "esm", you can either explicitly set it to "esm" or remove the field entirely.',
    );
  }

  return wasmConfig?.mode ?? (bundle ? 'compile' : 'preserve');
};

export const composeWasmConfig = ({
  bundle,
  format,
  mode,
  outBase,
  wasmDistDir,
}: {
  bundle: boolean;
  format: Format;
  mode: WasmMode;
  outBase: string | null;
  wasmDistDir: string;
}): {
  externalConfig: EnvironmentConfig;
  config: EnvironmentConfig;
} => {
  if (format !== 'esm' || mode === 'compile') {
    return { externalConfig: {}, config: {} };
  }

  const preserveOptions = {
    preserveToSource: !bundle,
    wasmDistDir,
    outBase: bundle ? undefined : (outBase ?? undefined),
  };

  return {
    externalConfig: {
      output: {
        externals: [createWasmPreserveExternal(preserveOptions)],
      },
    },
    config: {
      tools: {
        rspack: {
          plugins: [new WasmPreserveEmitPlugin(preserveOptions)],
        },
      },
    },
  };
};
