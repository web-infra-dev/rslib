/**
 * The methods and types exported from this file are considered as
 * the public API of @rslib/core.
 */

import type { RsbuildPlugin, Rspack } from '@rsbuild/core';
import { rspack } from '@rsbuild/core';

export { runCLI, type RunCLIOptions } from './cli';
export { createRslib } from './createRslib';
export {
  defineConfig,
  loadConfig,
  loadEnv,
  type ConfigParams,
  type LoadConfigOptions,
  type LoadConfigResult,
  type LoadEnvOptions,
  type LoadEnvResult,
  type RslibConfigAsyncFn,
  type RslibConfigDefinition,
  type RslibConfigSyncFn,
} from './loadConfig';
export { mergeRslibConfig } from './mergeConfig';

export type {
  AutoExternal,
  BannerAndFooter,
  BuildOptions,
  BuildResult,
  CreateRslibOptions,
  Dts,
  ExeOptions,
  Format,
  InspectConfigOptions,
  InspectConfigResult,
  LibConfig,
  LibExperiments,
  OnAfterCreateRsbuildFn,
  Redirect,
  RslibConfig,
  RslibInstance,
  Shims,
  StartDevServerResult,
  StartMFDevServerOptions,
  Syntax,
  Wasm,
} from './types';

export const version: string = RSLIB_VERSION;

export * as rsbuild from '@rsbuild/core';
export type * as Rsbuild from '@rsbuild/core';
export { rspack };
export type { RsbuildPlugin, Rspack };
