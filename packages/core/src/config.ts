import fs from 'node:fs';
import path, { dirname, extname, isAbsolute, join } from 'node:path';
import {
  type RsbuildConfig,
  type RsbuildInstance,
  createRsbuild,
  defineConfig as defineRsbuildConfig,
  loadConfig as loadRsbuildConfig,
  mergeRsbuildConfig,
  rspack,
} from '@rsbuild/core';
import glob from 'fast-glob';
import ts from 'typescript';
import {
  DEFAULT_CONFIG_NAME,
  DEFAULT_EXTENSIONS,
  SWC_HELPERS,
} from './constant';
import type {
  AutoExternal,
  BannerAndFooter,
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
  isEmptyObject,
  isObject,
  nodeBuiltInModules,
  omit,
  pick,
  readPackageJson,
} from './utils/helper';
import { logger } from './utils/logger';
import { transformSyntaxToBrowserslist } from './utils/syntax';
import { getTsconfigCompilerOptions } from './utils/tsconfig';

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

const resolveConfigPath = (root: string, customConfig?: string): string => {
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

  throw new Error(`${DEFAULT_CONFIG_NAME} not found in ${root}`);
};

export async function loadConfig({
  cwd = process.cwd(),
  path,
  envMode,
}: {
  cwd?: string;
  path?: string;
  envMode?: string;
}): Promise<RslibConfig> {
  const configFilePath = resolveConfigPath(cwd, path);
  const { content } = await loadRsbuildConfig({
    cwd: dirname(configFilePath),
    path: configFilePath,
    envMode,
  });

  return content as RslibConfig;
}

const composeExternalsWarnConfig = (
  format: Format,
  ...externalsArray: NonNullable<RsbuildConfig['output']>['externals'][]
): RsbuildConfig => {
  if (format !== 'esm') {
    return {};
  }

  const externals: NonNullable<RsbuildConfig['output']>['externals'] = [];
  for (const e of externalsArray.filter(Boolean)) {
    if (Array.isArray(e)) {
      externals.push(...e);
    } else {
      // @ts-ignore
      externals.push(e);
    }
  }

  // Match logic is derived from https://github.com/webpack/webpack/blob/94aba382eccf3de1004d235045d4462918dfdbb7/lib/ExternalModuleFactoryPlugin.js#L166-L293.
  const matchUserExternals = (
    externals: NonNullable<RsbuildConfig['output']>['externals'],
    request: string,
    callback: (matched?: true) => void,
  ) => {
    if (typeof externals === 'string') {
      if (externals === request) {
        callback(true);
        return;
      }
    } else if (Array.isArray(externals)) {
      let i = 0;
      const next = () => {
        let asyncFlag: boolean;
        const handleExternalsAndCallback = (matched?: true) => {
          if (!matched) {
            if (asyncFlag) {
              asyncFlag = false;
              return;
            }
            return next();
          }

          callback(matched);
        };

        do {
          asyncFlag = true;
          if (i >= externals.length) {
            return callback();
          }
          matchUserExternals(
            externals[i++],
            request,
            handleExternalsAndCallback,
          );
        } while (!asyncFlag);
        asyncFlag = false;
      };

      next();
      return;
    } else if (externals instanceof RegExp) {
      if (externals.test(request)) {
        callback(true);
        return;
      }
    } else if (typeof externals === 'function') {
      // TODO: Support function
    } else if (typeof externals === 'object') {
      if (Object.prototype.hasOwnProperty.call(externals, request)) {
        callback(true);
        return;
      }
    }

    callback();
  };

  return {
    output: {
      externals: [
        ({ request, dependencyType, contextInfo }: any, callback: any) => {
          let externalized = false;
          const _callback = (matched?: true) => {
            if (matched) {
              externalized = true;
            }
          };

          if (contextInfo.issuer && dependencyType === 'commonjs') {
            matchUserExternals(externals, request, _callback);
            if (externalized) {
              logger.warn(composeModuleImportWarn(request));
            }
          }
          callback();
        },
      ],
    },
  };
};

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

export function composeMinifyConfig(
  minify: NonNullable<RsbuildConfig['output']>['minify'],
): RsbuildConfig {
  if (minify !== undefined) {
    // User's minify configuration will be merged afterwards.
    return {};
  }

  // When minify is not specified, Rslib will use a sane default for minify options.
  // The default options will only perform dead code elimination and unused code elimination.
  return {
    output: {
      minify: {
        js: true,
        css: false,
        jsOptions: {
          minimizerOptions: {
            mangle: false,
            minify: false,
            compress: {
              defaults: false,
              unused: true,
              dead_code: true,
              toplevel: true,
            },
            format: {
              comments: 'all',
            },
          },
        },
      },
    },
  };
}

export function composeBannerFooterConfig(
  banner: BannerAndFooter,
  footer: BannerAndFooter,
): RsbuildConfig {
  const bannerConfig = pick(banner, ['js', 'css']);
  const footerConfig = pick(footer, ['js', 'css']);

  if (isEmptyObject(bannerConfig) && isEmptyObject(footerConfig)) {
    return {};
  }

  const plugins = [];

  if (!isEmptyObject(bannerConfig)) {
    if (bannerConfig.js) {
      plugins.push(
        new rspack.BannerPlugin({
          banner: bannerConfig.js,
          stage: rspack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE + 1,
          raw: true,
          include: /\.(js|mjs|cjs)$/,
        }),
      );
    }
    if (bannerConfig.css) {
      plugins.push(
        new rspack.BannerPlugin({
          banner: bannerConfig.css,
          stage: rspack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE + 1,
          raw: true,
          include: /\.(css)$/,
        }),
      );
    }
  }

  if (!isEmptyObject(footerConfig)) {
    if (footerConfig.js) {
      plugins.push(
        new rspack.BannerPlugin({
          banner: footerConfig.js,
          stage: rspack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE + 1,
          raw: true,
          footer: true,
          include: /\.(js|mjs|cjs)$/,
        }),
      );
    }
    if (footerConfig.css) {
      plugins.push(
        new rspack.BannerPlugin({
          banner: footerConfig.css,
          stage: rspack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE + 1,
          raw: true,
          footer: true,
          include: /\.(css)$/,
        }),
      );
    }
  }

  return {
    tools: {
      rspack: {
        plugins,
      },
    },
  };
}

export function composeDecoratorsConfig(
  options: ts.CompilerOptions,
  version?: NonNullable<
    NonNullable<RsbuildConfig['source']>['decorators']
  >['version'],
): RsbuildConfig {
  if (version || !options.experimentalDecorators) {
    return {};
  }

  return {
    source: {
      decorators: {
        version: 'legacy',
      },
    },
  };
}

export async function createConstantRsbuildConfig(): Promise<RsbuildConfig> {
  return defineRsbuildConfig({
    mode: 'production',
    dev: {
      progressBar: false,
    },
    tools: {
      htmlPlugin: false,
      rspack: {
        optimization: {
          moduleIds: 'named',
          nodeEnv: false,
        },
        experiments: {
          rspackFuture: {
            bundlerInfo: {
              force: false,
            },
          },
        },
        // TypeScript-specific behavior: if the extension is ".js" or ".jsx", try replacing it with ".ts" or ".tsx"
        // see https://github.com/web-infra-dev/rslib/issues/41
        resolve: {
          extensionAlias: {
            '.js': ['.ts', '.tsx', '.js', '.jsx'],
            '.jsx': ['.tsx', '.jsx'],
            '.mjs': ['.mts', '.mjs'],
            '.cjs': ['.cts', '.cjs'],
          },
        },
      },
    },
    output: {
      filenameHash: false,
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
            output: {
              module: true,
              chunkFormat: 'module',
              library: {
                type: 'modern-module',
              },
            },
            module: {
              parser: {
                javascript: {
                  importMeta: false,
                },
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

export const composeModuleImportWarn = (request: string): string => {
  return `The externalized commonjs request ${color.green(`"${request}"`)} will use ${color.blue('"module"')} external type in ESM format. If you want to specify other external type, considering set the request and type with ${color.blue('"output.externals"')}.`;
};

const composeExternalsConfig = (
  format: Format,
  externals: NonNullable<RsbuildConfig['output']>['externals'],
): RsbuildConfig => {
  // TODO: Define the internal externals config in Rsbuild's externals instead
  // Rspack's externals as they will not be merged from different fields. All externals
  // should to be unified and merged together in the future.

  const externalsTypeMap = {
    esm: 'module-import',
    cjs: 'commonjs',
    umd: 'umd',
  } as const;

  switch (format) {
    case 'esm':
    case 'cjs':
    case 'umd':
      return {
        output: externals
          ? {
              externals,
            }
          : {},
        tools: {
          rspack: {
            externalsType: externalsTypeMap[format],
          },
        },
      };
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
};

const composeAutoExtensionConfig = (
  config: LibConfig,
  autoExtension: boolean,
  pkgJson?: PkgJson,
): {
  config: RsbuildConfig;
  jsExtension: string;
  dtsExtension: string;
} => {
  const { jsExtension, dtsExtension } = getDefaultExtension({
    format: config.format!,
    pkgJson,
    autoExtension,
  });

  return {
    config: {
      output: {
        filename: {
          js: `[name]${jsExtension}`,
          ...config.output?.filename,
        },
      },
    },
    jsExtension,
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
    // 1. A string of glob pattern: { entry: { index: 'src/*.ts' } }
    // 2. An array of glob patterns: { entry: { index: ['src/*.ts', 'src/*.tsx'] } }
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

const composeBundleConfig = (
  jsExtension: string,
  bundle = true,
): RsbuildConfig => {
  if (bundle) return {};

  return {
    output: {
      externals: [
        (data: any, callback: any) => {
          // Issuer is not empty string when the module is imported by another module.
          // Prevent from externalizing entry modules here.
          if (data.contextInfo.issuer) {
            // Node.js ECMAScript module loader does no extension searching.
            // Add a file extension according to autoExtension config
            // when data.request is a relative path and do not have an extension.
            // If data.request already have an extension, we replace it with new extension
            // This may result in a change in semantics,
            // user should use copy to keep origin file or use another separate entry to deal this
            let request = data.request;
            if (request[0] === '.') {
              request = extname(request)
                ? request.replace(/\.[^.]+$/, jsExtension)
                : `${request}${jsExtension}`;
            }
            return callback(null, request);
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
  const { dts, bundle, output, autoExternal, banner, footer } = libConfig;

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
        banner: banner?.dts,
        footer: footer?.dts,
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
            // "__dirname" and "__filename" shims will automatically be enabled when `output.module` is `true`,
            // and leave them as-is in the rest of the cases.
            // { node: { __dirname: ..., __filename: ... } }
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

const composeExternalHelpersConfig = (
  externalHelpers: boolean,
  pkgJson?: PkgJson,
): RsbuildConfig => {
  let defaultConfig = {
    tools: {
      swc: {
        jsc: {
          externalHelpers: false,
        },
      },
    },
  };

  if (externalHelpers) {
    const deps = [
      ...Object.keys(pkgJson?.dependencies ?? []),
      ...Object.keys(pkgJson?.devDependencies ?? []),
    ];

    if (!deps.includes(SWC_HELPERS)) {
      logger.error(
        `${color.green('externalHelpers')} is enabled, but the ${color.blue(SWC_HELPERS)} dependency declaration was not found in package.json.`,
      );
      process.exit(1);
    }

    defaultConfig = Object.assign(defaultConfig, {
      output: {
        externals: new RegExp(`^${SWC_HELPERS}($|\\/|\\\\)`),
      },
    });
    defaultConfig.tools.swc.jsc.externalHelpers = true;
  }

  return defaultConfig;
};

async function composeLibRsbuildConfig(config: LibConfig, configPath: string) {
  const rootPath = dirname(configPath);
  const pkgJson = readPackageJson(rootPath);
  let compilerOptions: ts.CompilerOptions = {};
  const tsconfigPath = ts.findConfigFile(
    rootPath,
    ts.sys.fileExists,
    config.source?.tsconfigPath ?? 'tsconfig.json',
  );
  if (tsconfigPath) {
    compilerOptions = getTsconfigCompilerOptions(tsconfigPath);
  }

  const {
    format,
    banner = {},
    footer = {},
    autoExtension = true,
    autoExternal = true,
    externalHelpers = false,
  } = config;
  const formatConfig = composeFormatConfig(format!);
  const externalHelpersConfig = composeExternalHelpersConfig(
    externalHelpers,
    pkgJson,
  );
  const externalsConfig = composeExternalsConfig(
    format!,
    config.output?.externals,
  );
  const {
    config: autoExtensionConfig,
    jsExtension,
    dtsExtension,
  } = composeAutoExtensionConfig(config, autoExtension, pkgJson);
  const bundleConfig = composeBundleConfig(jsExtension, config.bundle);
  const targetConfig = composeTargetConfig(config.output?.target);
  const syntaxConfig = composeSyntaxConfig(
    config?.syntax,
    config.output?.target,
  );
  const autoExternalConfig = composeAutoExternalConfig({
    autoExternal,
    pkgJson,
    userExternals: config.output?.externals,
  });
  const entryConfig = await composeEntryConfig(
    config.source?.entry,
    config.bundle,
    dirname(configPath),
  );
  const dtsConfig = await composeDtsConfig(config, dtsExtension);
  const externalsWarnConfig = composeExternalsWarnConfig(
    format!,
    autoExternalConfig?.output?.externals,
    externalsConfig?.output?.externals,
  );
  const minifyConfig = composeMinifyConfig(config.output?.minify);
  const bannerFooterConfig = composeBannerFooterConfig(banner, footer);
  const decoratorsConfig = composeDecoratorsConfig(
    compilerOptions,
    config.source?.decorators?.version,
  );

  return mergeRsbuildConfig(
    formatConfig,
    externalHelpersConfig,
    // externalsWarnConfig should before other externals config
    externalsWarnConfig,
    externalsConfig,
    autoExternalConfig,
    autoExtensionConfig,
    syntaxConfig,
    bundleConfig,
    targetConfig,
    entryConfig,
    minifyConfig,
    dtsConfig,
    bannerFooterConfig,
    decoratorsConfig,
  );
}

export async function composeCreateRsbuildConfig(
  rslibConfig: RslibConfig,
  path?: string,
): Promise<{ format: Format; config: RsbuildConfig }[]> {
  const constantRsbuildConfig = await createConstantRsbuildConfig();
  const configPath = path ?? rslibConfig._privateMeta?.configFilePath!;
  const { lib: libConfigsArray, ...sharedRsbuildConfig } = rslibConfig;

  if (!libConfigsArray) {
    throw new Error(
      `Expect lib field to be an array, but got ${libConfigsArray}.`,
    );
  }

  const libConfigPromises = libConfigsArray.map(async (libConfig) => {
    const userConfig = mergeRsbuildConfig<LibConfig>(
      sharedRsbuildConfig,
      libConfig,
    );

    // Merge the configuration of each environment based on the shared Rsbuild
    // configuration and Lib configuration in the settings.
    const libRsbuildConfig = await composeLibRsbuildConfig(
      userConfig,
      configPath,
    );

    // Reset certain fields because they will be completely overridden by the upcoming merge.
    // We don't want to retain them in the final configuration.
    // The reset process should occur after merging the library configuration.
    userConfig.source ??= {};
    userConfig.source.entry = {};

    // Already manually sort and merge the externals configuration.
    userConfig.output ??= {};
    delete userConfig.output.externals;

    return {
      format: libConfig.format!,
      // The merge order represents the priority of the configuration
      // The priorities from high to low are as follows:
      // 1 - userConfig: users can configure any Rsbuild and Rspack config
      // 2 - libRsbuildConfig: the configuration that we compose from Rslib unique config and userConfig from 1
      // 3 - constantRsbuildConfig: the built-in best practice Rsbuild configuration we provide in Rslib
      // We should state in the document that the built-in configuration should not be changed optionally
      // In compose process of 2, we may read some config from 1, and reassemble the related config,
      // so before final mergeRsbuildConfig, we reset some specified fields
      config: mergeRsbuildConfig(
        constantRsbuildConfig,
        libRsbuildConfig,
        omit(userConfig, [
          'bundle',
          'format',
          'autoExtension',
          'autoExternal',
          'syntax',
          'externalHelpers',
          'banner',
          'footer',
          'dts',
        ]),
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
