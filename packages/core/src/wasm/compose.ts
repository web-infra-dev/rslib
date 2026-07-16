import type { EnvironmentConfig, Rspack } from '@rsbuild/core';
import type { Format, Wasm, WasmMode } from '../types';
import { createWasmPreserveExternal, WasmPreservePlugin } from './preserve';

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

  const mode = wasmConfig?.mode ?? (bundle ? 'compile' : 'preserve');

  if (bundle && mode === 'preserve') {
    throw new Error(
      'When using "wasm.mode: preserve", "bundle" must be set to "false". Use "wasm.mode: compile" to process WebAssembly in bundle mode.',
    );
  }

  return mode;
};

export const composeWasmConfig = ({
  format,
  jsFilename,
  mode,
  outBase,
}: {
  format: Format;
  jsFilename: Rspack.Filename;
  mode: WasmMode;
  outBase: string | null;
}): {
  externalConfig: EnvironmentConfig;
  config: EnvironmentConfig;
} => {
  if (format !== 'esm' || mode === 'compile') {
    return { externalConfig: {}, config: {} };
  }

  const preserveOptions = {
    jsFilename,
    outBase: outBase!,
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
          plugins: [new WasmPreservePlugin(preserveOptions)],
        },
      },
    },
  };
};
