import fs from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';
import {
  type RsbuildConfig,
  createRsbuild,
  defineConfig as defineRsbuildConfig,
  mergeRsbuildConfig,
} from '@rsbuild/core';
import { DEFAULT_CONFIG_NAME, DEFAULT_EXTENSIONS } from './constant';
import type {
  Format,
  LibConfig,
  RslibConfig,
  RslibConfigAsyncFn,
  RslibConfigExport,
  RslibConfigSyncFn,
} from './types/config';
import { color } from './utils/helper';
import { logger } from './utils/logger';

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

const findConfig = (basePath: string): string | undefined => {
  return DEFAULT_EXTENSIONS.map((ext) => basePath + ext).find(fs.existsSync);
};

const resolveConfigPath = (root: string, customConfig?: string) => {
  if (customConfig) {
    const customConfigPath = isAbsolute(customConfig)
      ? customConfig
      : join(root, customConfig);
    if (fs.existsSync(customConfigPath)) {
      return customConfigPath;
    }
    logger.warn(`Cannot find config file: ${color.dim(customConfigPath)}\n`);
  }

  const configFilePath = findConfig(join(root, DEFAULT_CONFIG_NAME));

  if (configFilePath) {
    return configFilePath;
  }

  return undefined;
};

export async function loadConfig(
  customConfig?: string,
  envMode?: string,
): Promise<RslibConfig> {
  const root = process.cwd();
  const configFilePath = resolveConfigPath(root, customConfig)!;

  const { loadConfig } = await import('@rsbuild/core');

  const { content } = await loadConfig({
    cwd: dirname(configFilePath),
    path: configFilePath,
    envMode,
  });

  return content as RslibConfig;
}

export async function createInternalRsbuildConfig(): Promise<RsbuildConfig> {
  return defineRsbuildConfig({
    dev: {
      progressBar: false,
    },
    tools: {
      htmlPlugin: false,
    },
    output: {
      filenameHash: false,
      // TODO: easy to development at the moment
      minify: false,
      distPath: {
        js: './',
      },
    },
  });
}

export function convertLibConfigToRsbuildConfig(
  libConfig: LibConfig,
  rsbuildConfig: RsbuildConfig,
): RsbuildConfig {
  switch (libConfig.format) {
    case 'esm':
      return mergeRsbuildConfig(rsbuildConfig, {
        tools: {
          rspack: {
            output: {
              module: true,
              iife: false,
              library: {
                type: 'modern-module',
              },
            },
            optimization: {
              concatenateModules: true,
            },
            experiments: {
              outputModule: true,
            },
          },
        },
      });
    case 'cjs':
      return mergeRsbuildConfig(rsbuildConfig, {
        tools: {
          rspack: {
            output: {
              library: {
                type: 'commonjs',
              },
            },
          },
        },
      });
    case 'umd':
      return mergeRsbuildConfig(rsbuildConfig, {
        tools: {
          rspack: {
            output: {
              library: {
                type: 'umd',
              },
            },
          },
        },
      });
    default:
      return rsbuildConfig;
  }
}

export async function composeCreateRsbuildConfig(
  rslibConfig: RslibConfig,
): Promise<Partial<Record<Format, RsbuildConfig>>> {
  const internalRsbuildConfig = await createInternalRsbuildConfig();

  const { lib: libConfigsArray, ...sharedRsbuildConfig } = rslibConfig;

  if (!libConfigsArray) {
    throw new Error(
      `Expect lib field to be an array, but got ${libConfigsArray}.`,
    );
  }

  const composedRsbuildConfig: Partial<Record<Format, RsbuildConfig>> = {};

  for (const libConfig of libConfigsArray) {
    const { format, ...overrideRsbuildConfig } = libConfig;

    // Merge order matters, keep `internalRsbuildConfig` at the last position
    // to ensure that the internal config is not overridden by the user's config.
    const mergedRsbuildConfig = mergeRsbuildConfig(
      sharedRsbuildConfig,
      overrideRsbuildConfig,
      internalRsbuildConfig,
    );

    composedRsbuildConfig[format!] = convertLibConfigToRsbuildConfig(
      libConfig,
      mergedRsbuildConfig,
    );
  }

  return composedRsbuildConfig;
}

export async function initRsbuild(rslibConfig: RslibConfig) {
  const rsbuildConfigObject = await composeCreateRsbuildConfig(rslibConfig);

  return createRsbuild({
    rsbuildConfig: {
      environments: rsbuildConfigObject,
    },
  });
}
