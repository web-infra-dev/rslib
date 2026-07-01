import type { Rspack } from '@rsbuild/core';
import type { WasmMode } from '../types';

export const PLUGIN_NAME = 'rslib:wasm';

export type ResolvedWasmConfig = {
  mode: WasmMode;
  hasUserWasmMode: boolean;
};

export type WasmCompilerContext = {
  compiler?: Rspack.Compiler;
  compilation?: Rspack.Compilation;
};
