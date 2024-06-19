import fs from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';
import {
  type RsbuildConfig,
  defineConfig as defineRsbuildConfig,
  mergeRsbuildConfig,
} from '@rsbuild/core';
import { DEFAULT_CONFIG_NAME, DEFAULT_EXTENSIONS } from './constant';
import type {
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
    tools: {
      htmlPlugin: false,
      rspack: {
        output: {
          module: true,
          library: {
            type: 'module',
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
    output: {
      filenameHash: false,
      minify: false,
      distPath: {
        js: './',
      },
    },
  });
}

export function convertLibConfigtoRsbuildConfig(
  libConfig: LibConfig,
  rsbuildConfig: RsbuildConfig,
): RsbuildConfig {
  // TODO: Configuration mapping needs to be implemented according to features added in the future
  if (libConfig.format === 'cjs') {
    mergeRsbuildConfig(rsbuildConfig, {
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
  }

  if (libConfig.format === 'esm') {
    mergeRsbuildConfig(rsbuildConfig, {
      tools: {
        rspack: {
          output: {
            library: {
              type: 'module',
            },
          },
        },
      },
    });
  }

  return rsbuildConfig;
}

export async function composeCreateRsbuildConfig(
  rslibConfig: RslibConfig,
): Promise<RsbuildConfig[]> {
  const { mergeRsbuildConfig } = await import('@rsbuild/core');
  const internalRsbuildConfig = await createInternalRsbuildConfig();

  const { lib: libConfigsArray, ...sharedRsbuildConfig } = rslibConfig;

  if (!libConfigsArray) {
    logger.error('You must specify lib field in config file.');
    return [];
  }

  const composedRsbuildConfig = libConfigsArray.map((libConfig: LibConfig) => {
    const { format, ...overrideRsbuildConfig } = libConfig;

    const mergedRsbuildConfig = mergeRsbuildConfig(
      sharedRsbuildConfig,
      overrideRsbuildConfig,
      internalRsbuildConfig,
    );

    return convertLibConfigtoRsbuildConfig(libConfig, mergedRsbuildConfig);
  });

  return composedRsbuildConfig;
}

export async function initRsbuild(rslibConfig: RslibConfig) {
  const { createRsbuild } = await import('@rsbuild/core');
  // TODO: use environment API instead
  const rsbuildConfigArray = await composeCreateRsbuildConfig(rslibConfig);

  const rsbuildPromises = rsbuildConfigArray.map(
    async (rsbuildConfig: RslibConfig) => {
      return createRsbuild({ rsbuildConfig });
    },
  );

  const rsbuildInstances = await Promise.all(rsbuildPromises);

  return rsbuildInstances;
}
