import {
  loadConfig as loadRsbuildConfig,
  type LoadConfigOptions as RsbuildLoadConfigOptions,
} from '@rsbuild/core';
import type { RslibConfig } from './types';

export type ConfigParams = {
  env: string;
  command: string;
  envMode?: string;
  meta?: Record<string, unknown>;
};

export type RslibConfigSyncFn = (env: ConfigParams) => RslibConfig;

export type RslibConfigAsyncFn = (env: ConfigParams) => Promise<RslibConfig>;

export type RslibConfigExport =
  RslibConfig | RslibConfigSyncFn | RslibConfigAsyncFn;

export type LoadConfigOptions = RsbuildLoadConfigOptions;

export type ConfigLoader = RsbuildLoadConfigOptions['loader'];

export type LoadConfigResult<Config = RslibConfig> = {
  /**
   * The loaded configuration object.
   */
  content: Config;
  /**
   * The path to the loaded configuration file.
   * Return `null` if the configuration file is not found.
   */
  filePath: string | null;
};

/**
 * This function helps you to autocomplete configuration types.
 * It accepts a Rslib config object, or a function that returns a config.
 */
export function defineConfig(config: RslibConfig): RslibConfig;
export function defineConfig(config: RslibConfigSyncFn): RslibConfigSyncFn;
export function defineConfig(config: RslibConfigAsyncFn): RslibConfigAsyncFn;
export function defineConfig(config: RslibConfigExport): RslibConfigExport;
export function defineConfig(config: RslibConfigExport) {
  return config;
}

const RSLIB_CONFIG_FILE_NAMES = [
  // `.mjs` and `.ts` are the most used configuration types,
  // so we resolve them first for performance
  'rslib.config.mjs',
  'rslib.config.ts',
  'rslib.config.js',
  'rslib.config.cjs',
  'rslib.config.mts',
  'rslib.config.cts',
];

export async function loadConfig<Config = RslibConfig>(
  options: LoadConfigOptions = {},
): Promise<LoadConfigResult<Config>> {
  const { content, filePath } = await loadRsbuildConfig<Config>({
    ...options,
    configFileNames: options.configFileNames ?? RSLIB_CONFIG_FILE_NAMES,
  });

  return { content, filePath };
}

export {
  type LoadEnvOptions,
  type LoadEnvResult,
  loadEnv,
} from '@rsbuild/core';
