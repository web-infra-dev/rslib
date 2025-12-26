import fs from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';
import {
  loadConfig as loadRsbuildConfig,
  type LoadConfigOptions as RsbuildLoadConfigOptions,
} from '@rsbuild/core';
import type { RslibConfig } from './types';
import { color } from './utils/color';
import { logger } from './utils/logger';

export type ConfigParams = {
  env: string;
  command: string;
  envMode?: string;
  meta?: Record<string, unknown>;
};

export type RslibConfigSyncFn = (env: ConfigParams) => RslibConfig;

export type RslibConfigAsyncFn = (env: ConfigParams) => Promise<RslibConfig>;

export type RslibConfigExport =
  | RslibConfig
  | RslibConfigSyncFn
  | RslibConfigAsyncFn;

export type LoadConfigOptions = Pick<
  RsbuildLoadConfigOptions,
  'cwd' | 'path' | 'envMode' | 'meta' | 'loader'
>;

export type ConfigLoader = RsbuildLoadConfigOptions['loader'];

export type LoadConfigResult = {
  /**
   * The loaded configuration object.
   */
  content: RslibConfig;
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

const resolveConfigPath = (
  root: string,
  customConfig?: string,
): string | null => {
  if (customConfig) {
    const customConfigPath = isAbsolute(customConfig)
      ? customConfig
      : join(root, customConfig);
    if (fs.existsSync(customConfigPath)) {
      return customConfigPath;
    }
    const error = new Error(
      `${color.dim('[rslib:loadConfig]')} Cannot find config file: ${color.dim(customConfigPath)}`,
    );
    error.stack = '';
    throw error;
  }

  const CONFIG_FILES = [
    // `.mjs` and `.ts` are the most used configuration types,
    // so we resolve them first for performance
    'rslib.config.mjs',
    'rslib.config.ts',
    'rslib.config.js',
    'rslib.config.cjs',
    'rslib.config.mts',
    'rslib.config.cts',
  ];

  for (const file of CONFIG_FILES) {
    const configFile = join(root, file);

    if (fs.existsSync(configFile)) {
      return configFile;
    }
  }

  return null;
};

export async function loadConfig({
  cwd = process.cwd(),
  path,
  envMode,
  meta,
  loader,
}: LoadConfigOptions): Promise<LoadConfigResult> {
  const configFilePath = resolveConfigPath(cwd, path);

  if (!configFilePath) {
    logger.debug('no config file found.');
    return {
      content: {} as RslibConfig,
      filePath: null,
    };
  }

  const { content } = await loadRsbuildConfig({
    cwd: dirname(configFilePath),
    path: configFilePath,
    envMode,
    meta,
    loader,
  });

  return { content: content as RslibConfig, filePath: configFilePath };
}

export {
  type LoadEnvOptions,
  type LoadEnvResult,
  loadEnv,
} from '@rsbuild/core';
