/**
 * The methods and types exported from this file are considered as
 * the public API of @rslib/core.
 */

export { runCLI } from './cli';
export { createRslib } from './createRslib';
export {
  type ConfigParams,
  defineConfig,
  type LoadConfigOptions,
  type LoadConfigResult,
  type LoadEnvOptions,
  type LoadEnvResult,
  loadConfig,
  loadEnv,
} from './loadConfig';
export { mergeRslibConfig } from './mergeConfig';

export type {
  AutoExternal,
  BannerAndFooter,
  BuildOptions,
  BuildResult,
  CreateRslibOptions,
  Dts,
  Format,
  InspectConfigOptions,
  InspectConfigResult,
  LibConfig,
  LibExperiments,
  Redirect,
  RslibConfig,
  RslibContext,
  RslibInstance,
  Shims,
  StartMFDevServerOptions,
  StartServerResult,
  Syntax,
} from './types';

export const version: string = RSLIB_VERSION;

export type * as Rsbuild from '@rsbuild/core';
export * as rsbuild from '@rsbuild/core';
export {
  type RsbuildPlugin,
  type Rspack,
  rspack,
} from '@rsbuild/core';
