import {
  loadConfig as loadRsbuildConfig,
  type LoadConfigOptions,
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

export type RslibConfigDefinition =
  RslibConfig | RslibConfigSyncFn | RslibConfigAsyncFn;

export type ConfigLoader = LoadConfigOptions['loader'];

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
export function defineConfig<const Config extends RslibConfig>(
  config: (env: ConfigParams) => Config,
): (env: ConfigParams) => Config;
export function defineConfig<const Config extends RslibConfig>(
  config: (env: ConfigParams) => Promise<Config>,
): (env: ConfigParams) => Promise<Config>;
export function defineConfig(config: RslibConfig): RslibConfig;
export function defineConfig(
  config: RslibConfigDefinition,
): RslibConfigDefinition;
export function defineConfig(config: RslibConfigDefinition) {
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
  type LoadConfigOptions,
  type LoadEnvOptions,
  type LoadEnvResult,
  loadEnv,
} from '@rsbuild/core';
