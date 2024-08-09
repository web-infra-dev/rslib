import fs from 'node:fs';
import path, { dirname, isAbsolute, join } from 'node:path';
import {
  type RsbuildConfig,
  type RsbuildInstance,
  createRsbuild,
  defineConfig as defineRsbuildConfig,
  loadConfig as loadRsbuildConfig,
  mergeRsbuildConfig,
} from '@rsbuild/core';
import glob from 'fast-glob';
import { DEFAULT_CONFIG_NAME, DEFAULT_EXTENSIONS } from './constant';
import type {
  AutoExternal,
  Format,
  LibConfig,
  PkgJson,
  RslibConfig,
  RslibConfigAsyncFn,
  RslibConfigExport,
  RslibConfigSyncFn,
  Syntax,
} from './types';
import { getDefaultExtension } from './utils/extension';
import {
  calcLongestCommonPath,
  color,
  isObject,
  nodeBuiltInModules,
  readPackageJson,
} from './utils/helper';
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
  const { content } = await loadRsbuildConfig({
    cwd: dirname(configFilePath),
    path: configFilePath,
    envMode,
  });

  return content as RslibConfig;
}

export const composeAutoExternalConfig = (options: {
  autoExternal: AutoExternal;
  pkgJson?: PkgJson;
  userExternals?: NonNullable<RsbuildConfig['output']>['externals'];
}): RsbuildConfig => {
  const { autoExternal, pkgJson, userExternals } = options;

  if (!autoExternal) {
    return {};
  }

  if (!pkgJson) {
    logger.warn(
      'autoExternal configuration will not be applied due to read package.json failed',
    );
    return {};
  }

  const externalOptions = {
    dependencies: true,
    peerDependencies: true,
    devDependencies: false,
    ...(autoExternal === true ? {} : autoExternal),
  };

  // User externals configuration has higher priority than autoExternal
  // eg: autoExternal: ['react'], user: output: { externals: { react: 'react-1' } }
  // Only handle the case where the externals type is object, string / string[] does not need to be processed, other types are too complex.
  const userExternalKeys =
    userExternals && isObject(userExternals) ? Object.keys(userExternals) : [];

  const externals = (
    ['dependencies', 'peerDependencies', 'devDependencies'] as const
  )
    .reduce<string[]>((prev, type) => {
      if (externalOptions[type]) {
        return pkgJson[type] ? prev.concat(Object.keys(pkgJson[type]!)) : prev;
      }
      return prev;
    }, [])
    .filter((name) => !userExternalKeys.includes(name));

  const uniqueExternals = Array.from(new Set(externals));

  return externals.length
    ? {
        output: {
          externals: [
            // Exclude dependencies, e.g. `react`, `react/jsx-runtime`
            ...uniqueExternals.map((dep) => new RegExp(`^${dep}($|\\/|\\\\)`)),
            ...uniqueExternals,
          ],
        },
      }
    : {};
};

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

const composeFormatConfig = (format: Format): RsbuildConfig => {
  switch (format) {
    case 'esm':
      return {
        tools: {
          rspack: {
            externalsType: 'module-import',
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

const composeAutoExtensionConfig = (
  format: Format,
  autoExtension: boolean,
  pkgJson?: PkgJson,
): {
  config: RsbuildConfig;
  dtsExtension: string;
} => {
  const { jsExtension, dtsExtension } = getDefaultExtension({
    format,
    pkgJson,
    autoExtension,
  });

  return {
    config: {
      output: {
        filename: {
          js: `[name]${jsExtension}`,
        },
      },
    },
    dtsExtension,
  };
};

const composeSyntaxConfig = (
  syntax?: Syntax,
  target?: string,
): RsbuildConfig => {
  // Defaults to ESNext, Rslib will assume all of the latest JavaScript and CSS features are supported.
  if (syntax) {
    return {
      tools: {
        rspack: (config) => {
          // TODO: Rspack should could resolve `browserslist:{query}` like webpack.
          // https://webpack.js.org/configuration/target/#browserslist
          // Using 'es5' as a temporary solution for compatibility.
          config.target = ['es5'];
          return config;
        },
      },
      output: {
        overrideBrowserslist: transformSyntaxToBrowserslist(syntax),
      },
    };
  }

  // If `syntax` is not defined, Rslib will try to determine by the `target`, with the last version of the target.
  const lastTargetVersions = {
    node: ['last 1 node versions'],
    web: [
      'last 1 Chrome versions',
      'last 1 Firefox versions',
      'last 1 Edge versions',
      'last 1 Safari versions',
      'last 1 ios_saf versions',
      'not dead',
    ],
  };

  return {
    tools: {
      rspack: (config) => {
        config.target = ['es2022'];
        return config;
      },
    },
    output: {
      overrideBrowserslist:
        target === 'web'
          ? lastTargetVersions.web
          : target === 'node'
            ? lastTargetVersions.node
            : [...lastTargetVersions.node, ...lastTargetVersions.web],
    },
  };
};

const composeEntryConfig = async (
  entries: NonNullable<RsbuildConfig['source']>['entry'],
  bundle: LibConfig['bundle'],
  root: string,
): Promise<RsbuildConfig> => {
  if (!entries) {
    return {};
  }

  if (bundle !== false) {
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
    const lcp = await calcLongestCommonPath(resolvedEntryFiles);
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

const composeBundleConfig = (bundle = true): RsbuildConfig => {
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

const composeDtsConfig = async (
  libConfig: LibConfig,
  dtsExtension: string,
): Promise<RsbuildConfig> => {
  const { dts, bundle, output, autoExternal } = libConfig;

  if (dts === false || dts === undefined) return {};

  const { pluginDts } = await import('rsbuild-plugin-dts');
  return {
    plugins: [
      pluginDts({
        bundle: dts?.bundle ?? bundle,
        distPath: dts?.distPath ?? output?.distPath?.root ?? './dist',
        abortOnError: dts?.abortOnError ?? true,
        dtsExtension,
        autoExternal,
      }),
    ],
  };
};

const composeTargetConfig = (target = 'web'): RsbuildConfig => {
  switch (target) {
    case 'web':
      return {
        tools: {
          rspack: {
            target: ['web'],
          },
        },
      };
    case 'node':
      return {
        tools: {
          rspack: {
            target: ['node'],
          },
        },
        output: {
          // When output.target is 'node', Node.js's built-in will be treated as externals of type `node-commonjs`.
          // Simply override the built-in modules to make them external.
          // https://github.com/webpack/webpack/blob/dd44b206a9c50f4b4cb4d134e1a0bd0387b159a3/lib/node/NodeTargetPlugin.js#L81
          externals: nodeBuiltInModules,
          target: 'node',
        },
      };
    case 'neutral':
      return {
        tools: {
          rspack: {
            target: ['web', 'node'],
          },
        },
      };
    default:
      throw new Error(`Unsupported platform: ${target}`);
  }
};

async function composeLibRsbuildConfig(
  libConfig: LibConfig,
  rsbuildConfig: RsbuildConfig,
  configPath: string,
) {
  const config = mergeRsbuildConfig<LibConfig>(rsbuildConfig, libConfig);
  const rootPath = dirname(configPath);
  const pkgJson = readPackageJson(rootPath);

  const { format, autoExtension = true, autoExternal = true } = config;
  const formatConfig = composeFormatConfig(format!);
  const { config: autoExtensionConfig, dtsExtension } =
    composeAutoExtensionConfig(format!, autoExtension, pkgJson);
  const bundleConfig = composeBundleConfig(config.bundle);
  const targetConfig = composeTargetConfig(config.output?.target);
  const syntaxConfig = composeSyntaxConfig(
    config.output?.syntax,
    config.output?.target,
  );
  const autoExternalConfig = composeAutoExternalConfig({
    autoExternal,
    pkgJson,
    userExternals: rsbuildConfig.output?.externals,
  });
  const entryConfig = await composeEntryConfig(
    config.source?.entry,
    config.bundle,
    dirname(configPath),
  );
  const dtsConfig = await composeDtsConfig(config, dtsExtension);

  return mergeRsbuildConfig(
    formatConfig,
    autoExtensionConfig,
    autoExternalConfig,
    syntaxConfig,
    bundleConfig,
    targetConfig,
    entryConfig,
    dtsConfig,
  );
}

export async function composeCreateRsbuildConfig(
  rslibConfig: RslibConfig,
  path?: string,
): Promise<{ format: Format; config: RsbuildConfig }[]> {
  const internalRsbuildConfig = await createInternalRsbuildConfig();
  const configPath = path ?? rslibConfig._privateMeta?.configFilePath!;
  const { lib: libConfigsArray, ...sharedRsbuildConfig } = rslibConfig;

  if (!libConfigsArray) {
    throw new Error(
      `Expect lib field to be an array, but got ${libConfigsArray}.`,
    );
  }

  const libConfigPromises = libConfigsArray.map(async (libConfig) => {
    const { format, ...overrideRsbuildConfig } = libConfig;

    const baseRsbuildConfig = mergeRsbuildConfig(
      sharedRsbuildConfig,
      overrideRsbuildConfig,
    );

    // Merge the configuration of each environment based on the shared Rsbuild
    // configuration and Lib configuration in the settings.
    const libRsbuildConfig = await composeLibRsbuildConfig(
      libConfig,
      baseRsbuildConfig,
      configPath,
    );

    // Reset certain fields because they will be completely overridden by the upcoming merge.
    // We don't want to retain them in the final configuration.
    // The reset process should occur after merging the library configuration.
    baseRsbuildConfig.source ??= {};
    baseRsbuildConfig.source.entry = {};

    return {
      format: format!,
      config: mergeRsbuildConfig(
        baseRsbuildConfig,
        libRsbuildConfig,
        // Merge order matters, keep `internalRsbuildConfig` at the last position
        // to ensure that the internal config is not overridden by user's config.
        internalRsbuildConfig,
      ),
    };
  });

  const composedRsbuildConfig = await Promise.all(libConfigPromises);
  return composedRsbuildConfig;
}

export async function initRsbuild(
  rslibConfig: RslibConfig,
): Promise<RsbuildInstance> {
  const rsbuildConfigObject = await composeCreateRsbuildConfig(rslibConfig);
  const environments: RsbuildConfig['environments'] = {};
  const formatCount: Record<Format, number> = rsbuildConfigObject.reduce(
    (acc, { format }) => {
      acc[format] = (acc[format] ?? 0) + 1;
      return acc;
    },
    {} as Record<Format, number>,
  );

  const formatIndex: Record<Format, number> = {
    esm: 0,
    cjs: 0,
    umd: 0,
  };

  for (const { format, config } of rsbuildConfigObject) {
    const currentFormatCount = formatCount[format];
    const currentFormatIndex = formatIndex[format]++;

    environments[
      currentFormatCount === 1 ? format : `${format}${currentFormatIndex}`
    ] = config;
  }

  return createRsbuild({
    rsbuildConfig: {
      environments,
    },
  });
}
