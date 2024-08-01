import fs from 'node:fs';
import path, { dirname, isAbsolute, join } from 'node:path';
import {
  type RsbuildConfig,
  createRsbuild,
  defineConfig as defineRsbuildConfig,
  mergeRsbuildConfig,
} from '@rsbuild/core';
import glob from 'fast-glob';
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
import { calcLongestCommonPath } from './utils/helper';
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
        optimization: {
          moduleIds: 'named',
        },
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
              iife: false,
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

const getDefaultSyntaxConfig = (syntax?: Syntax): RsbuildConfig => {
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

const getDefaultEntryConfig = async (
  entries: NonNullable<RsbuildConfig['source']>['entry'],
  libConfig: LibConfig,
  root: string,
): Promise<RsbuildConfig> => {
  if (!entries) {
    return {};
  }

  if (libConfig.bundle !== false) {
    return {
      source: {
        entry: entries,
      },
    };
  }

  // In bundleless mode, resolve glob patterns and convert them to entry object.
  const resolvedEntries: Record<string, string> = {};
  for (const key of Object.keys(entries)) {
    const entry = entries[key];

    // Entries in bundleless mode could be:
    // 1. A string of glob pattern: { entry: { main: 'src/*.ts' } }
    // 2. An array of glob patterns: { entry: { main: ['src/*.ts', 'src/*.tsx'] } }
    // Not supported for now: entry description object
    const entryFiles = Array.isArray(entry)
      ? entry
      : typeof entry === 'string'
        ? [entry]
        : null;

    if (!entryFiles) {
      throw new Error(
        'Entry can only be a string or an array of strings for now',
      );
    }

    // Turn entries in array into each separate entry.
    const resolvedEntryFiles = await glob(entryFiles, {
      cwd: root,
    });

    if (resolvedEntryFiles.length === 0) {
      throw new Error(`Cannot find ${resolvedEntryFiles}`);
    }

    // Similar to `rootDir` in tsconfig and `outbase` in esbuild.
    const lcp = calcLongestCommonPath(resolvedEntryFiles);
    // Using the longest common path of all non-declaration input files by default.
    const outBase = lcp === null ? root : lcp;

    for (const file of resolvedEntryFiles) {
      const { dir, name } = path.parse(path.relative(outBase, file));
      // Entry filename contains nested path to preserve source directory structure.
      const entryFileName = path.join(dir, name);
      resolvedEntries[entryFileName] = file;
    }
  }

  return {
    source: {
      entry: resolvedEntries,
    },
  };
};

const getBundleConfig = (bundle = true): RsbuildConfig => {
  if (bundle) return {};

  return {
    output: {
      externals: [
        (data: any, callback: any) => {
          // Issuer is not empty string when the module is imported by another module.
          // Prevent from externalizing entry modules here.
          if (data.contextInfo.issuer) {
            return callback(null, data.request);
          }
          callback();
        },
      ],
    },
  };
};

const getDefaultDtsConfig = async (
  libConfig: LibConfig,
  entryConfig: RsbuildConfig,
): Promise<RsbuildConfig> => {
  const { dts, bundle, output } = libConfig;

  if (dts === false || dts === undefined) return {};

  const { pluginDts } = await import('rsbuild-plugin-dts');
  return {
    plugins: [
      pluginDts({
        bundle: dts?.bundle ?? bundle,
        distPath: dts?.distPath ?? output?.distPath?.root ?? './dist',
        tsconfigPath: dts?.tsconfigPath,
        // TODO: temporarily use main as dts entry
        entryPath: entryConfig.source?.entry?.main as string,
      }),
    ],
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
  const syntaxConfig = getDefaultSyntaxConfig(libConfig.output?.syntax);
  const bundleConfig = getBundleConfig(libConfig.bundle);

  return mergeRsbuildConfig(
    formatConfig,
    autoExtensionConfig,
    syntaxConfig,
    bundleConfig,
  );
}

async function postUpdateRsbuildConfig(
  libConfig: LibConfig,
  rsbuildConfig: RsbuildConfig,
  configPath: string,
) {
  const defaultTargetConfig = getDefaultTargetConfig(
    rsbuildConfig.output?.target ?? 'web',
  );

  const defaultEntryConfig = await getDefaultEntryConfig(
    rsbuildConfig.source?.entry,
    libConfig,
    dirname(configPath),
  );

  const defaultDtsConfig = await getDefaultDtsConfig(
    libConfig,
    defaultEntryConfig,
  );

  return mergeRsbuildConfig(
    defaultTargetConfig,
    defaultEntryConfig,
    defaultDtsConfig,
  );
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
  path?: string,
): Promise<Partial<Record<Format, RsbuildConfig>>> {
  const internalRsbuildConfig = await createInternalRsbuildConfig();
  const configPath = path ?? rslibConfig._privateMeta?.configFilePath!;
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
    const postUpdatedConfig = await postUpdateRsbuildConfig(
      libConfig,
      mergedRsbuildConfig,
      configPath,
    );

    // Reset some fields as they will be totally overridden by the following merge
    // and we don't want to keep them in the final config.
    mergedRsbuildConfig.source ??= {};
    mergedRsbuildConfig.source.entry = {};

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
