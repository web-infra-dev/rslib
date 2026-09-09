import {
  loadConfig as loadRsbuildConfig,
  type LoadConfigOptions,
  type RsbuildConfig,
  type LoadConfigResult as RsbuildLoadConfigResult,
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

export type LoadConfigResult<Config = RslibConfig> =
  RsbuildLoadConfigResult<Config>;

/**
 * This function helps you to autocomplete configuration types.
 * It accepts a Rslib config object, or a function that returns a config.
 */
export function defineConfig<
  const Config extends RslibConfig,
  const Definition extends
    | Config
    | ((env: ConfigParams) => Config)
    | ((env: ConfigParams) => Promise<Config>),
>(
  config: Definition &
    (Definition extends (...args: never[]) => infer CallbackResult
      ? [Awaited<CallbackResult>] extends [RslibConfig]
        ? unknown
        : never
      : RslibConfig &
          Record<Exclude<keyof Definition, keyof RslibConfig>, never>),
): Definition extends (...args: never[]) => infer CallbackResult
  ? [CallbackResult] extends [RslibConfig]
    ? RslibConfigSyncFn
    : RslibConfigAsyncFn
  : RslibConfig;
export function defineConfig<const Config extends RslibConfig>(
  config: (env: ConfigParams) => Config,
): RslibConfigSyncFn;
export function defineConfig<const Config extends RslibConfig>(
  config: (env: ConfigParams) => Promise<Config>,
): RslibConfigAsyncFn;
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
  const result = await loadRsbuildConfig<Config>({
    ...options,
    configFileNames: options.configFileNames ?? RSLIB_CONFIG_FILE_NAMES,
  });

  // Metadata is passed through the load result instead of the config object.
  delete (result.content as RsbuildConfig)._privateMeta;

  return result;
}

export {
  loadEnv,
  type LoadConfigOptions,
  type LoadEnvOptions,
  type LoadEnvResult,
} from '@rsbuild/core';
