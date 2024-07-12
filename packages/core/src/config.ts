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
  Syntax,
} from './types/config';
import { getDefaultExtension } from './utils/extension';
import { color } from './utils/helper';
import { nodeBuiltInModules } from './utils/helper';
import { logger } from './utils/logger';
import { transformSyntaxToBrowserslist } from './utils/syntax';

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
      rspack: {
        experiments: {
          rspackFuture: {
            bundlerInfo: {
              force: false,
            },
          },
        },
      },
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

const getDefaultFormatConfig = (format: Format): RsbuildConfig => {
  switch (format) {
    case 'esm':
      return {
        tools: {
          rspack: {
            externalsType: 'module',
            output: {
              module: true,
              chunkFormat: 'module',
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
      };
    case 'cjs':
      return {
        tools: {
          rspack: {
            externalsType: 'commonjs',
            output: {
              chunkFormat: 'commonjs',
              library: {
                type: 'commonjs',
              },
            },
          },
        },
      };
    case 'umd':
      return {
        tools: {
          rspack: {
            externalsType: 'umd',
            output: {
              library: {
                type: 'umd',
              },
            },
          },
        },
      };
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
};

const getDefaultAutoExtensionConfig = (
  format: Format,
  root: string,
  autoExtension: boolean,
): RsbuildConfig => {
  const { jsExtension } = getDefaultExtension({
    format,
    root,
    autoExtension,
  });

  return {
    output: {
      filename: {
        js: `[name]${jsExtension}`,
      },
    },
  };
};

const getDefaultSyntax = (syntax?: Syntax): RsbuildConfig => {
  // Defaults to ESNext, Rslib will assume all of the latest JavaScript and CSS features are supported.
  return syntax === undefined
    ? {
        tools: {
          rspack: {
            // The highest is 2022 in Rspack
            target: 'es2022',
          },
          swc(config) {
            config.jsc ??= {};
            config.jsc.target = 'esnext';
            delete config.env;
            return config;
          },
        },
      }
    : {
        output: {
          overrideBrowserslist: transformSyntaxToBrowserslist(syntax),
        },
      };
};

export function convertLibConfigToRsbuildConfig(
  libConfig: LibConfig,
  configPath: string,
): RsbuildConfig {
  const { format, autoExtension = false } = libConfig;

  const formatConfig = getDefaultFormatConfig(format!);
  const autoExtensionConfig = getDefaultAutoExtensionConfig(
    format!,
    dirname(configPath),
    autoExtension,
  );
  const syntaxConfig = getDefaultSyntax(libConfig.output?.syntax);

  return mergeRsbuildConfig(formatConfig, autoExtensionConfig, syntaxConfig);
}

function postUpdateRsbuildConfig(rsbuildConfig: RsbuildConfig) {
  const defaultTargetConfig = getDefaultTargetConfig(
    rsbuildConfig.output?.target ?? 'web',
  );

  return mergeRsbuildConfig(defaultTargetConfig);
}

const getDefaultTargetConfig = (target: string): RsbuildConfig => {
  switch (target) {
    case 'web':
      return {};
    case 'node':
      return {
        output: {
          // When output.target is 'node', Node.js's built-in will be treated as externals of type `node-commonjs`.
          // Simply override the built-in modules to make them external.
          // https://github.com/webpack/webpack/blob/dd44b206a9c50f4b4cb4d134e1a0bd0387b159a3/lib/node/NodeTargetPlugin.js#L81
          externals: nodeBuiltInModules,
          target: 'node',
        },
      };
    case 'neutral':
      return {};
    default:
      throw new Error(`Unsupported platform: ${target}`);
  }
};

export async function composeCreateRsbuildConfig(
  rslibConfig: RslibConfig,
): Promise<Partial<Record<Format, RsbuildConfig>>> {
  const internalRsbuildConfig = await createInternalRsbuildConfig();
  const configPath = rslibConfig._privateMeta?.configFilePath ?? process.cwd();
  const { lib: libConfigsArray, ...sharedRsbuildConfig } = rslibConfig;

  if (!libConfigsArray) {
    throw new Error(
      `Expect lib field to be an array, but got ${libConfigsArray}.`,
    );
  }

  const composedRsbuildConfig: Partial<Record<Format, RsbuildConfig>> = {};

  for (const libConfig of libConfigsArray) {
    const { format, ...overrideRsbuildConfig } = libConfig;

    const libConvertedRsbuildConfig = convertLibConfigToRsbuildConfig(
      libConfig,
      configPath,
    );

    const mergedRsbuildConfig = mergeRsbuildConfig(
      sharedRsbuildConfig,
      overrideRsbuildConfig,
      libConvertedRsbuildConfig,
    );

    // Some configurations can be defined both in the shared config and the lib config.
    // So we need to do the post process after lib config is converted and merged.
    const postUpdatedConfig = postUpdateRsbuildConfig(mergedRsbuildConfig);

    composedRsbuildConfig[format!] = mergeRsbuildConfig(
      mergedRsbuildConfig,
      postUpdatedConfig,
      // Merge order matters, keep `internalRsbuildConfig` at the last position
      // to ensure that the internal config is not overridden by user's config.
      internalRsbuildConfig,
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
