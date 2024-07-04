import type { RsbuildConfig } from '@rsbuild/core';

export type Format = 'esm' | 'cjs' | 'umd';

export interface LibConfig extends RsbuildConfig {
  format?: Format;
  platform?: 'node' | 'browser' | 'neutral';
}

export interface RslibConfig extends RsbuildConfig {
  lib: LibConfig[];
}

export type ConfigParams = {
  env: string;
  command: string;
  envMode?: string;
};

export type RslibConfigSyncFn = (env: ConfigParams) => RslibConfig;
export type RslibConfigAsyncFn = (env: ConfigParams) => Promise<RslibConfig>;
export type RslibConfigExport =
  | RslibConfig
  | RslibConfigSyncFn
  | RslibConfigAsyncFn;
