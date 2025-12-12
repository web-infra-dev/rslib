/**
 * The methods and types exported from this file are considered as
 * the public API of @rslib/core.
 */

export { runCLI } from './cli';
export { build } from './cli/build';
export { inspect } from './cli/inspect';
export { startMFDevServer } from './cli/mf';
export {
  composeCreateRsbuildConfig as unstable_composeCreateRsbuildConfig,
  defineConfig,
  loadConfig,
} from './config';
export type * from './types';
export { logger } from './utils/logger';

export const version: string = RSLIB_VERSION;

export type * as Rsbuild from '@rsbuild/core';
export * as rsbuild from '@rsbuild/core';
export { type RsbuildPlugin, type Rspack, rspack } from '@rsbuild/core';
