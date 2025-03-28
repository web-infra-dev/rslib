export { prepareCli } from './cli/prepare';
export { runCli } from './cli/commands';
export { build } from './cli/build';
export { inspect } from './cli/inspect';
export { startMFDevServer } from './cli/mf';
export {
  defineConfig,
  loadConfig,
  composeCreateRsbuildConfig as unstable_composeCreateRsbuildConfig,
} from './config';
export { logger } from './utils/logger';
export type * from './types';

export const version: string = RSLIB_VERSION;

export { rspack, type Rspack } from '@rsbuild/core';
export * as rsbuild from '@rsbuild/core';
