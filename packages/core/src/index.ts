export { build } from './cli/build';
export { runCli } from './cli/commands';
export { inspect } from './cli/inspect';
export { startMFDevServer } from './cli/mf';
export { prepareCli } from './cli/prepare';
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
