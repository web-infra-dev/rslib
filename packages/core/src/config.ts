import fs from 'node:fs';
import path, { dirname, extname, join } from 'node:path';
import {
  defineConfig as defineRsbuildConfig,
  type EnvironmentConfig,
  mergeRsbuildConfig,
  type RsbuildConfig,
  type RsbuildEntry,
  type RsbuildPlugin,
  type RsbuildPlugins,
  type Rspack,
  rspack,
  type ToolsConfig,
} from '@rsbuild/core';
import { glob } from 'tinyglobby';
import { composeAssetConfig } from './asset/assetConfig';
import {
  DTS_EXTENSIONS_PATTERN,
  JS_EXTENSIONS_PATTERN,
  SWC_HELPERS,
} from './constant';
import {
  composeCssConfig,
  cssExternalHandler,
  RSLIB_CSS_ENTRY_FLAG,
} from './css/cssConfig';
import { type CssLoaderOptionsAuto, isCssGlobalFile } from './css/utils';
import { composeEntryChunkConfig } from './plugins/EntryChunkPlugin';
import {
  pluginCjsImportMetaUrlShim,
  pluginEsmRequireShim,
} from './plugins/shims';
import type {
  AutoExternal,
  BannerAndFooter,
  DeepRequired,
  ExcludesFalse,
  Format,
  JsRedirect,
  LibConfig,
  LibOnlyConfig,
  PkgJson,
  Redirect,
  RequireKey,
  RsbuildConfigEntry,
  RsbuildConfigEntryItem,
  RsbuildConfigOutputTarget,
  RsbuildConfigWithLibInfo,
  RslibConfig,
  RspackResolver,
  Shims,
  Syntax,
} from './types';
import { color } from './utils/color';
import { getDefaultExtension } from './utils/extension';
import {
  calcLongestCommonPath,
  checkMFPlugin,
  isDirectory,
  isEmptyObject,
  isIntermediateOutputFormat,
  isObject,
  nodeBuiltInModules,
  normalizeSlash,
  omit,
  pick,
  readPackageJson,
} from './utils/helper';
import { isDebug, logger } from './utils/logger';
import {
  ESX_TO_BROWSERSLIST,
  transformSyntaxToBrowserslist,
  transformSyntaxToRspackTarget,
} from './utils/syntax';
import { loadTsconfig } from './utils/tsconfig';

// Match logic is derived from https://github.com/webpack/webpack/blob/94aba382eccf3de1004d235045d4462918dfdbb7/lib/ExternalModuleFactoryPlugin.js#L89-L158
const handleMatchedExternal = (
  value: string | string[] | boolean | Record<string, string | string[]>,
  request: string,
): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const [first, second] = value.split(' ');
    const hasType = !!second;
    const _request = second ? second : first;

    // Don't need to warn explicit declared external type.
    if (!hasType) {
      return request === _request;
    }

    return false;
  }

  if (Array.isArray(value)) {
    return handleMatchedExternal(value[0] ?? '', request);
  }

  if (typeof value === 'object') {
    return false;
  }

  return false;
};

const composeExternalsWarnConfig = (
  format: Format,
  ...externalsArray: NonNullable<EnvironmentConfig['output']>['externals'][]
): EnvironmentConfig => {
  if (format !== 'esm') {
    return {};
  }

  const externals: NonNullable<EnvironmentConfig['output']>['externals'] = [];
  for (const e of externalsArray.filter(Boolean)) {
    if (Array.isArray(e)) {
      externals.push(...e);
    } else {
      // @ts-expect-error
      externals.push(e);
    }
  }

  // Match logic is derived from https://github.com/webpack/webpack/blob/94aba382eccf3de1004d235045d4462918dfdbb7/lib/ExternalModuleFactoryPlugin.js#L166-L293.
  const matchUserExternals = (
    externals: NonNullable<EnvironmentConfig['output']>['externals'],
    request: string,
    callback: (matched: boolean, shouldWarn?: boolean) => void,
  ) => {
    // string
    if (typeof externals === 'string') {
      if (handleMatchedExternal(externals, request)) {
        callback(true, true);
        return;
      }
    }
    // array
    if (Array.isArray(externals)) {
      let i = 0;
      const next = () => {
        let asyncFlag: boolean;
        const handleExternalsAndCallback = (
          matched: boolean,
          shouldWarn?: boolean,
        ) => {
          if (!matched) {
            if (asyncFlag) {
              asyncFlag = false;
              return;
            }
            next();
            return;
          }

          callback(matched, shouldWarn);
        };

        do {
          asyncFlag = true;
          if (i >= externals.length) {
            callback(false);
            return;
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
    }
    // regexp
    if (externals instanceof RegExp) {
      if (externals.test(request)) {
        callback(true, true);
        return;
      }
    }
    // function
    else if (typeof externals === 'function') {
      // TODO: Support function
    }
    // object
    else if (typeof externals === 'object') {
      if (Object.hasOwn(externals, request)) {
        if (handleMatchedExternal(externals[request]!, request)) {
          callback(true, true);
        } else {
          callback(true);
        }
        return;
      }
    }

    callback(false);
  };

  return {
    output: {
      externals: [
        ({ request, dependencyType, contextInfo }: any, callback: any) => {
          let shouldWarn = false;
          const _callback = (_matched: boolean, _shouldWarn?: boolean) => {
            if (_shouldWarn) {
              shouldWarn = true;
            }
          };

          if (contextInfo.issuer && dependencyType === 'commonjs') {
            matchUserExternals(externals, request, _callback);
            if (shouldWarn) {
              logger.warn(composeModuleImportWarn(request, contextInfo.issuer));
            }
          }
          callback();
        },
      ],
    },
  };
};

const getAutoExternalDefaultValue = (
  format: Format,
  autoExternal?: AutoExternal,
): AutoExternal => {
  return autoExternal ?? isIntermediateOutputFormat(format);
};

export const composeAutoExternalConfig = (options: {
  bundle: boolean;
  format: Format;
  autoExternal?: AutoExternal;
  pkgJson?: PkgJson;
  userExternals?: NonNullable<EnvironmentConfig['output']>['externals'];
}): EnvironmentConfig => {
  const { bundle, format, pkgJson, userExternals } = options;

  // If bundle is false, autoExternal will be disabled
  if (!bundle) {
    return {};
  }

  const autoExternal = getAutoExternalDefaultValue(
    format,
    options.autoExternal,
  );

  if (autoExternal === false) {
    return {};
  }

  if (!pkgJson) {
    logger.warn(
      'The `autoExternal` configuration will not be applied due to read package.json failed',
    );
    return {};
  }

  // User externals configuration has higher priority than autoExternal
  // eg: autoExternal: ['react'], user: output: { externals: { react: 'react-1' } }
  // Only handle the case where the externals type is object, string / string[] does not need to be processed, other types are too complex.
  const userExternalKeys =
    userExternals && isObject(userExternals) ? Object.keys(userExternals) : [];

  const externalOptions = {
    dependencies: true,
    optionalDependencies: true,
    peerDependencies: true,
    devDependencies: false,
    ...(autoExternal === true ? {} : autoExternal),
  };

  const externals = (
    [
      'dependencies',
      'peerDependencies',
      'devDependencies',
      'optionalDependencies',
    ] as const
  )
    .reduce<string[]>((prev, type) => {
      if (externalOptions[type]) {
        return pkgJson[type] ? prev.concat(Object.keys(pkgJson[type])) : prev;
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

export function composeMinifyConfig(config: LibConfig): EnvironmentConfig {
  const minify = config.output?.minify;
  const format = config.format;
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
          // Tweaked based on https://github.com/web-infra-dev/rspack/blob/e350b76163c976ee48da54c29bbb9d72153738d7/crates/rspack_plugin_swc_js_minimizer/src/lib.rs#L40.
          test: /\.[cm]?jsx?(\?.*)?$/,
          minimizerOptions: {
            mangle: false,
            // MF assets are loaded over the network, which means they will not be compressed by the project. Therefore, minifying them is necessary.
            minify: format === 'mf',
            compress: {
              directives: false,
              defaults: false,
              unused: true,
              dead_code: true,
              // remoteEntry's global variable will be tree-shaken if `toplevel` is enabled in "mf" format
              toplevel: format !== 'mf',
            },
            format: {
              comments: 'some',
              preserve_annotations: true,
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
): EnvironmentConfig {
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
  compilerOptions?: Record<string, any>,
  version?: NonNullable<
    NonNullable<EnvironmentConfig['source']>['decorators']
  >['version'],
): EnvironmentConfig {
  if (version || !compilerOptions?.experimentalDecorators) {
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

export function composePrintFileSizeConfig(
  bundle: LibConfig['bundle'],
  target: RsbuildConfigOutputTarget,
): EnvironmentConfig {
  if (bundle) {
    return {};
  }

  // do not need to print detailed file size in bundleless mode
  return {
    performance: {
      printFileSize: {
        total: ({
          environmentName,
          distPath,
          assets,
          totalSize,
          totalGzipSize,
        }) => {
          let log = `${color.yellow(assets.length)} files generated in ${color.cyan(distPath)}, ${color.magenta('total:')} ${(totalSize / 1000).toFixed(1)} kB`;
          if (target === 'web') {
            log += ` ${color.green(`(${(totalGzipSize / 1000).toFixed(1)} kB gzipped)`)}`;
          }
          log += ` ${color.dim(`(${environmentName})`)}`;
          return log;
        },
        detail: false,
      },
    },
  };
}

export async function createConstantRsbuildConfig(): Promise<EnvironmentConfig> {
  // When the default configuration is inconsistent with rsbuild, remember to modify the type hints
  // see https://github.com/web-infra-dev/rslib/discussions/856
  return defineRsbuildConfig({
    performance: {
      chunkSplit: {
        strategy: 'custom',
      },
      buildCache: true,
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
      target: 'node',
      distPath: {
        js: './',
        jsAsync: './',
        css: './',
        cssAsync: './',
      },
    },
  });
}

const composeFormatConfig = ({
  format,
  bundle = true,
  umdName,
  pkgJson,
  enabledShims,
  advancedEsm,
}: {
  format: Format;
  pkgJson: PkgJson;
  bundle?: boolean;
  umdName?: Rspack.LibraryName;
  enabledShims: DeepRequired<Shims>;
  advancedEsm: boolean;
}): EnvironmentConfig => {
  const jsParserOptions: Record<string, Rspack.JavascriptParserOptions> = {
    cjs: {
      requireResolve: false,
      requireDynamic: false,
      requireAsExpression: false,
    },
    esm: {
      importMeta: false,
      importDynamic: false,
      commonjs: {
        exports: 'skipInEsm',
      },
    },
    others: {
      worker: false,
    },
  };

  const experimentalEsmOutput = bundle && format === 'esm' && advancedEsm;

  // The built-in Rslib plugin will apply to all formats except the `mf` format.
  // The `mf` format functions more like an application than a library and requires additional webpack runtime.
  const plugins = [
    new rspack.experiments.RslibPlugin({
      interceptApiPlugin: true,
      forceNodeShims: enabledShims.esm.__dirname || enabledShims.esm.__filename,
    }),
    experimentalEsmOutput && new rspack.experiments.EsmLibraryPlugin(),
  ].filter(Boolean);

  switch (format) {
    case 'esm':
      return {
        output: {
          filenameHash: false,
        },
        tools: {
          rspack: {
            module: {
              parser: {
                javascript: {
                  ...jsParserOptions.esm,
                  ...jsParserOptions.cjs,
                  ...jsParserOptions.others,
                },
              },
            },
            optimization: {
              // experimentalEsmOutput don't need concatenateModules
              concatenateModules: !experimentalEsmOutput,
              sideEffects: experimentalEsmOutput ? true : 'flag',
              runtimeChunk: experimentalEsmOutput
                ? {
                    name: 'rslib-runtime',
                  }
                : undefined,
              avoidEntryIife: true,
              splitChunks: {
                // Splitted "sync" chunks will make entry modules can't be inlined.
                chunks: 'async',
              },
            },
            output: {
              module: true,
              chunkFormat: experimentalEsmOutput ? false : 'module',
              library: {
                type: 'modern-module',
              },
              chunkLoading: 'import',
              workerChunkLoading: 'import',
            },
            experiments: {
              outputModule: true,
            },
            plugins,
          },
        },
      };
    case 'cjs':
      return {
        output: {
          filenameHash: false,
        },
        tools: {
          rspack: {
            module: {
              parser: {
                javascript: {
                  ...jsParserOptions.esm,
                  ...jsParserOptions.cjs,
                  ...jsParserOptions.others,
                },
              },
            },
            optimization: {
              splitChunks: {
                // Splitted "sync" chunks will make entry modules can't be inlined.
                chunks: 'async',
              },
            },
            output: {
              iife: false,
              chunkFormat: 'commonjs',
              library: {
                type: 'commonjs-static',
              },
              chunkLoading: 'require',
              workerChunkLoading: 'async-node',
            },
            plugins,
          },
        },
      };
    case 'umd': {
      if (!bundle) {
        throw new Error(
          'When using "umd" format, "bundle" must be set to "true". Since the default value for "bundle" is "true", so you can either explicitly set it to "true" or remove the field entirely.',
        );
      }

      const config: EnvironmentConfig = {
        output: {
          filenameHash: false,
        },
        tools: {
          rspack: {
            module: {
              parser: {
                javascript: {
                  importMeta: false,
                },
              },
            },
            output: {
              asyncChunks: false,
              library: umdName
                ? {
                    type: 'umd',
                    name: umdName,
                  }
                : {
                    type: 'umd',
                  },
            },
            optimization: {
              nodeEnv: process.env.NODE_ENV,
              splitChunks: false,
            },
            plugins,
          },
        },
      };

      return config;
    }
    case 'iife': {
      if (!bundle) {
        throw new Error(
          'When using "iife" format, "bundle" must be set to "true". Since the default value for "bundle" is "true", so you can either explicitly set it to "true" or remove the field entirely.',
        );
      }

      const config: EnvironmentConfig = {
        output: {
          filenameHash: false,
          minify: {
            jsOptions: {
              minimizerOptions: {
                module: true,
              },
            },
          },
        },
        tools: {
          rspack: {
            module: {
              parser: {
                javascript: {
                  importMeta: false,
                },
              },
            },
            output: {
              iife: true,
              asyncChunks: false,
              library: {
                type: 'modern-module',
              },
            },
            optimization: {
              nodeEnv: process.env.NODE_ENV,
              splitChunks: false,
            },
            plugins,
          },
        },
      };

      return config;
    }
    case 'mf':
      if (!bundle) {
        throw new Error(
          'When using "mf" format, "bundle" must be set to "true". Since the default value for "bundle" is "true", so you can either explicitly set it to "true" or remove the field entirely.',
        );
      }

      return {
        dev: {
          writeToDisk: true,
        },
        tools: {
          rspack: (config, { env }) => {
            config.output = {
              ...config.output,
              uniqueName: pkgJson.name,
            };

            config.optimization = {
              ...config.optimization,
              // can not set nodeEnv to false, because mf format should build shared module.
              // If nodeEnv is false, the process.env.NODE_ENV in third-party packages's will not be replaced
              nodeEnv: env === 'development' ? 'development' : 'production',
              moduleIds: env === 'development' ? 'named' : 'deterministic',
            };
          },
        },
        output: {
          target: 'web',
        },
      };
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
};

const disableUrlParseRsbuildPlugin = (): RsbuildPlugin => ({
  name: 'rsbuild:disable-url-parse',
  setup(api) {
    api.modifyBundlerChain((config, { CHAIN_ID }) => {
      // Fix for https://github.com/web-infra-dev/rslib/issues/499.
      // Prevent parsing and try bundling `new URL()` in ESM format.
      config.module.rule(CHAIN_ID.RULE.JS).parser({
        url: false,
      });
    });
  },
});

// Port https://github.com/web-infra-dev/rsbuild/pull/5955 before it merged into Rsbuild.
const fixJsModuleTypePlugin = (): RsbuildPlugin => ({
  name: 'rsbuild:fix-js-module-type',
  setup(api) {
    api.modifyBundlerChain((config, { CHAIN_ID }) => {
      config.module.rule(CHAIN_ID.RULE.JS).delete('type');
    });
  },
});

const BundlePlugin = (): RsbuildPlugin => ({
  name: 'rslib:bundle',
  setup(api) {
    api.onBeforeBuild({
      order: 'post',
      handler: ({ bundlerConfigs }) => {
        if (bundlerConfigs) {
          for (const config of bundlerConfigs) {
            if (config?.module?.parser?.javascript?.jsx === true) {
              logger.error(
                'Bundle mode does not support preserving JSX syntax. Set "bundle" to "false" or change the JSX runtime to `automatic` or `classic`. Check out ' +
                  color.green(
                    'https://rslib.rs/guide/solution/react#jsx-transform',
                  ) +
                  ' for more details.',
              );
              process.exit(1);
            }
          }
        }
      },
    });
  },
});

const composeBundleConfig = (
  bundle: LibConfig['bundle'],
): { rsbuildConfig: EnvironmentConfig } => {
  if (bundle) {
    return {
      rsbuildConfig: {
        plugins: [BundlePlugin()],
      },
    };
  }

  return { rsbuildConfig: {} };
};

const composeShimsConfig = (
  format: Format,
  shims?: Shims,
): { rsbuildConfig: EnvironmentConfig; enabledShims: DeepRequired<Shims> } => {
  const resolvedShims = {
    cjs: {
      'import.meta.url': shims?.cjs?.['import.meta.url'] ?? true,
    },
    esm: {
      __filename: shims?.esm?.__filename ?? false,
      __dirname: shims?.esm?.__dirname ?? false,
      require: shims?.esm?.require ?? false,
    },
  };

  const enabledShims = {
    cjs:
      format === 'cjs'
        ? resolvedShims.cjs
        : {
            'import.meta.url': false,
          },
    esm:
      format === 'esm'
        ? resolvedShims.esm
        : {
            __filename: false,
            __dirname: false,
            require: false,
          },
  };

  let rsbuildConfig: EnvironmentConfig = {};
  switch (format) {
    case 'esm': {
      rsbuildConfig = {
        tools: {
          rspack: {
            node: {
              // "__dirname" and "__filename" shims will automatically be enabled when `output.module` is `true`
              __dirname: resolvedShims.esm.__dirname ? 'node-module' : false,
              __filename: resolvedShims.esm.__filename ? 'node-module' : false,
            },
          },
        },
        plugins: [
          resolvedShims.esm.require && pluginEsmRequireShim(),
          disableUrlParseRsbuildPlugin(),
          fixJsModuleTypePlugin(),
        ].filter(Boolean),
      };
      break;
    }
    case 'cjs':
      rsbuildConfig = {
        plugins: [
          resolvedShims.cjs['import.meta.url'] && pluginCjsImportMetaUrlShim(),
          disableUrlParseRsbuildPlugin(),
          fixJsModuleTypePlugin(),
        ].filter(Boolean),
      };
      break;
    case 'umd':
    case 'iife':
    case 'mf':
      rsbuildConfig = {
        plugins: [fixJsModuleTypePlugin()],
      };
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  return { rsbuildConfig, enabledShims };
};

export const composeModuleImportWarn = (
  request: string,
  issuer: string,
): string => {
  return `The externalized commonjs request ${color.green(`"${request}"`)} from ${color.green(issuer)} will use ${color.blue('"module"')} external type in ESM format. If you want to specify other external type, consider setting the request and type with ${color.blue('"output.externals"')}.`;
};

const composeExternalsConfig = (
  format: Format,
  externals: NonNullable<EnvironmentConfig['output']>['externals'],
): EnvironmentConfig => {
  // TODO: Define the internal externals config in Rsbuild's externals instead
  // Rspack's externals as they will not be merged from different fields. All externals
  // should to be unified and merged together in the future.

  const externalsTypeMap: Record<Format, Rspack.ExternalsType> = {
    esm: 'module-import',
    cjs: 'commonjs-import',
    umd: 'umd',
    // If use 'var', when projects import an external package like '@pkg', this will cause a syntax error such as 'var pkg = @pkg'.
    // If use 'umd', the judgement conditions may be affected by other packages that define variables like 'define'.
    // Therefore, we use 'global' to satisfy both web and node environments.
    mf: 'global',
    iife: 'global',
  };

  const globalObjectMap: Record<Format, string | undefined> = {
    esm: undefined,
    cjs: undefined,
    umd: undefined,
    mf: undefined,
    iife: 'globalThis',
  };

  const rspackConfig: ToolsConfig['rspack'] = {};
  const rsbuildConfig: EnvironmentConfig = {};

  switch (format) {
    case 'esm':
    case 'cjs':
    case 'umd':
    case 'mf':
    case 'iife':
      rsbuildConfig.output = externals ? { externals } : {};
      rspackConfig.externalsType = externalsTypeMap[format];
      if (globalObjectMap[format]) {
        rspackConfig.output = {
          globalObject: globalObjectMap[format],
        };
      }

      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  return {
    ...rsbuildConfig,
    tools: {
      rspack: rspackConfig,
    },
  };
};

const composeOutputFilenameConfig = (
  config: LibConfig,
  format: Format,
  autoExtension: boolean,
  multiCompilerIndex: number | null,
  pkgJson?: PkgJson,
): {
  config: EnvironmentConfig;
  jsExtension: string;
  dtsExtension: string;
} => {
  const { jsExtension, dtsExtension } = getDefaultExtension({
    format,
    pkgJson,
    autoExtension,
  });

  const filenameHash = config.output?.filenameHash ?? false;

  const getHash = () => {
    if (typeof filenameHash === 'string') {
      return filenameHash ? `.[${filenameHash}]` : '';
    }
    return filenameHash ? '.[contenthash:8]' : '';
  };

  // Copied from https://github.com/web-infra-dev/rspack/blob/2efea8673f86a562559e26a9351680e8df4d9ae9/packages/rspack/src/config/defaults.ts#L667-L680.
  const inferChunkFilename = (filename: string): string | undefined => {
    if (typeof filename !== 'function') {
      const hasName = filename.includes('[name]');
      const hasId = filename.includes('[id]');
      const hasChunkHash = filename.includes('[chunkhash]');
      const hasContentHash = filename.includes('[contenthash]');
      const multiCompilerPrefix =
        typeof multiCompilerIndex === 'number' ? `${multiCompilerIndex}~` : '';
      // Anything changing depending on chunk is fine

      if (hasChunkHash || hasContentHash || hasName || hasId)
        return filename.replace(
          /(^|\/)([^/]*(?:\?|$))/,
          `$1${multiCompilerPrefix}$2`,
        );
      // Otherwise prefix "[id]." in front of the basename to make it changing
      return filename.replace(
        /(^|\/)([^/]*(?:\?|$))/,
        `$1${multiCompilerIndex}[id].$2`,
      );
    }

    return undefined;
  };

  const hash = getHash();
  const defaultJsFilename = `[name]${hash}${jsExtension}`;
  const userJsFilename = config.output?.filename?.js;
  const defaultJsChunkFilename = inferChunkFilename(
    (userJsFilename as string) ?? defaultJsFilename,
  );

  // will be returned to use in redirect feature
  // only support string type for now since we can not get the return value of function
  const finalJsExtension =
    typeof userJsFilename === 'string' && userJsFilename
      ? extname(userJsFilename)
      : jsExtension;

  const chunkFilename: RsbuildConfig = {
    tools: {
      rspack: {
        output: {
          chunkFilename: defaultJsChunkFilename,
        },
      },
    },
  };

  const finalConfig: RsbuildConfig = userJsFilename
    ? chunkFilename
    : mergeRsbuildConfig(chunkFilename, {
        output: {
          filename: {
            js: defaultJsFilename,
          },
        },
      });

  return {
    // Do not modify MF's output hash configuration.
    config: format === 'mf' ? {} : finalConfig,
    jsExtension: finalJsExtension,
    dtsExtension,
  };
};

const composeSyntaxConfig = (
  target: RsbuildConfigOutputTarget,
  syntax?: Syntax,
): EnvironmentConfig => {
  // Defaults to ESNext, Rslib will assume all of the latest JavaScript and CSS features are supported.
  if (syntax) {
    return {
      tools: {
        rspack: (config) => {
          config.target = transformSyntaxToRspackTarget(syntax);
        },
      },
      output: {
        overrideBrowserslist: transformSyntaxToBrowserslist(syntax, target),
      },
    };
  }

  return {
    tools: {
      rspack: (config) => {
        config.target = ['es2022'];
        return config;
      },
    },
    output: {
      // If `syntax` is not defined, Rslib will try to determine by the `target`, with the last version of the target.
      overrideBrowserslist: ESX_TO_BROWSERSLIST.esnext(target),
    },
  };
};

const traverseEntryQuery = (
  entry: RsbuildConfigEntry,
  callback: (entry: string) => string,
): RsbuildConfigEntry => {
  const newEntry: Record<string, RsbuildConfigEntryItem> = {};

  for (const [key, value] of Object.entries(entry)) {
    let result: RsbuildConfigEntryItem = value;

    if (typeof value === 'string') {
      result = callback(value);
    } else if (Array.isArray(value)) {
      result = value.map(callback);
    } else {
      result = {
        ...value,
        import:
          typeof value.import === 'string'
            ? callback(value.import)
            : value.import.map(callback),
      };
    }

    newEntry[key] = result;
  }

  return newEntry;
};

export const resolveEntryPath = (
  entries: RsbuildConfigEntry,
  root: string,
): RsbuildEntry =>
  traverseEntryQuery(entries, (item) => path.resolve(root, item));

const composeEntryConfig = async (
  rawEntry: RsbuildConfigEntry,
  bundle: LibConfig['bundle'],
  root: string,
  cssModulesAuto: CssLoaderOptionsAuto,
  userOutBase?: string,
): Promise<{ entryConfig: EnvironmentConfig; outBase: string | null }> => {
  let entries: RsbuildConfigEntry = rawEntry;

  if (!entries) {
    // In bundle mode, return directly to let Rsbuild apply default entry to './src/index.ts'
    if (bundle !== false) {
      return { entryConfig: {}, outBase: null };
    }

    // In bundleless mode, set default entry to './src/**'
    entries = {
      index: 'src/**',
    };
  }

  // Type check to ensure entries is of the expected type
  if (typeof entries !== 'object') {
    throw new Error(
      `The ${color.cyan('source.entry')} configuration should be an object, but received ${typeof entries}: ${color.cyan(
        entries,
      )}. Checkout ${color.green('https://rslib.rs/config/rsbuild/source#sourceentry')} for more details.`,
    );
  }

  if (bundle !== false) {
    const entryErrorReasons: string[] = [];
    traverseEntryQuery(entries, (entry) => {
      const entryAbsPath = path.isAbsolute(entry)
        ? entry
        : path.resolve(root, entry);
      const isDirLike = path.extname(entryAbsPath) === '';
      const dirError = `Glob pattern ${color.cyan(`"${entry}"`)} is not supported when "bundle" is "true", considering "bundle" to "false" to use bundleless mode, or specify a file entry to bundle. See ${color.green('https://rslib.rs/guide/basic/output-structure')} for more details.`;

      if (fs.existsSync(entryAbsPath)) {
        const stats = fs.statSync(entryAbsPath);
        if (!stats.isFile()) {
          // Existed dir.
          entryErrorReasons.push(dirError);
        } else {
          // Existed file.
        }
      } else {
        if (isDirLike) {
          // Non-existed dir.
          entryErrorReasons.push(dirError);
        } else {
          // Non-existed file.
          entryErrorReasons.push(
            `Can't resolve the entry ${color.cyan(`"${entry}"`)} at the location ${color.cyan(entryAbsPath)}. Please ensure that the file exists.`,
          );
        }
      }

      return entry;
    });

    if (entryErrorReasons.length) {
      throw new AggregateError(
        entryErrorReasons.map((reason) => new Error(reason)),
      );
    }

    return {
      entryConfig: {
        source: {
          entry: resolveEntryPath(entries, root),
        },
      },
      outBase: null,
    };
  }

  const scanGlobEntries = async (tryResolveOutBase: boolean) => {
    // In bundleless mode, resolve glob patterns and convert them to entry object.
    const resolvedEntries: Record<string, string> = {};

    const resolveOutBase = async (resolvedEntryFiles: string[]) => {
      if (userOutBase !== undefined) {
        return path.isAbsolute(userOutBase)
          ? userOutBase
          : path.resolve(root, userOutBase);
      }
      // Similar to `rootDir` in tsconfig and `outbase` in esbuild.
      // Using the longest common path of all non-declaration input files if not specified.
      const lcp = (await calcLongestCommonPath(resolvedEntryFiles)) ?? root;
      return lcp;
    };

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
      const globEntryFiles = await glob(entryFiles, {
        cwd: root,
        absolute: true,
        dot: true,
        ignore: ['**/.DS_Store', '**/Thumbs.db'],
      });

      // Filter the glob resolved entry files based on the allowed extensions
      const resolvedEntryFiles = globEntryFiles.filter((i) => {
        return !DTS_EXTENSIONS_PATTERN.test(i);
      });

      if (resolvedEntryFiles.length === 0) {
        const error = new Error(
          `No entry files matching ${entryFiles.map((file) => color.cyan(file)).join(', ')}. Please ensure the entry pattern in ${color.cyan('source.entry')} is correct and points to valid source files.`,
        );
        error.stack = '';
        throw error;
      }

      const outBase = await resolveOutBase(resolvedEntryFiles);

      function getEntryName(file: string) {
        const { dir, name } = path.parse(path.relative(outBase, file));
        // Entry filename contains nested path to preserve source directory structure.
        const entryFileName = path.join(dir, name);

        // 1. we mark the global css files (which will generate empty js chunk in cssExtract), and deleteAsset in RemoveCssExtractAssetPlugin
        // 2. avoid the same name e.g: `index.ts` and `index.css`
        if (isCssGlobalFile(file, cssModulesAuto)) {
          return `${RSLIB_CSS_ENTRY_FLAG}/${entryFileName}`;
        }

        return entryFileName;
      }

      for (const file of resolvedEntryFiles) {
        const entryName = getEntryName(file);

        if (resolvedEntries[entryName]) {
          tryResolveOutBase &&
            logger.warn(
              `Duplicate entry ${color.cyan(entryName)} from ${color.cyan(
                path.relative(root, file),
              )} and ${color.cyan(
                path.relative(root, resolvedEntries[entryName]),
              )}, which may lead to the incorrect output, please rename the file.`,
            );
        }

        resolvedEntries[entryName] = file;
      }
    }

    if (tryResolveOutBase) {
      const outBase = await resolveOutBase(Object.values(resolvedEntries));
      return { resolvedEntries, outBase };
    }

    return { resolvedEntries, outBase: null };
  };

  // OutBase could only be determined at the first time of glob scan.
  const { outBase } = await scanGlobEntries(true);
  const entryConfig: EnvironmentConfig = {
    tools: {
      rspack: {
        entry: async () => {
          const { resolvedEntries } = await scanGlobEntries(false);
          return resolvedEntries;
        },
      },
    },
  };

  return {
    entryConfig,
    outBase,
  };
};

const composeBundlelessExternalConfig = (
  jsExtension: string,
  redirect: Redirect,
  cssModulesAuto: CssLoaderOptionsAuto,
  bundle: boolean,
  outBase: string | null,
): {
  config: EnvironmentConfig;
  resolvedJsRedirect?: DeepRequired<JsRedirect>;
} => {
  if (bundle) return { config: {} };

  const styleRedirectPath = redirect.style?.path ?? true;
  const styleRedirectExtension = redirect.style?.extension ?? true;
  const jsRedirectPath = redirect.js?.path ?? true;
  const jsRedirectExtension = redirect.js?.extension ?? true;
  const assetRedirectPath = redirect.asset?.path ?? true;
  const assetRedirectExtension = redirect.asset?.extension ?? true;

  let resolver: RspackResolver | undefined;

  return {
    resolvedJsRedirect: {
      path: jsRedirectPath,
      extension: jsRedirectExtension,
    },
    config: {
      output: {
        externals: [
          async (data, callback) => {
            const { request, getResolve, context, contextInfo } = data;
            if (!request || !getResolve || !context || !contextInfo) {
              callback();
              return;
            }
            const { issuer } = contextInfo;
            const originExtension = extname(request);

            if (!resolver) {
              resolver = getResolve() as RspackResolver;
            }

            async function redirectPath(
              request: string,
            ): Promise<{ path?: string; isResolved: boolean }> {
              try {
                let resolvedRequest = request;
                // use resolver to resolve the request
                resolvedRequest = await resolver!(context!, resolvedRequest);
                if (typeof outBase !== 'string') {
                  throw new Error(
                    `outBase expect to be a string in bundleless mode, but got ${outBase}`,
                  );
                }

                const isSubpath = normalizeSlash(resolvedRequest).startsWith(
                  `${normalizeSlash(outBase)}/`,
                );

                // only handle the request that within the root path
                if (isSubpath) {
                  resolvedRequest = normalizeSlash(
                    path.relative(path.dirname(issuer), resolvedRequest),
                  );
                  // Requests that fall through here cannot be matched by any other externals config ahead.
                  // Treat all these requests as relative import of source code. Node.js won't add the
                  // leading './' to the relative path resolved by `path.relative`. So add manually it here.
                  // should include dot files like '.hidden.ts'
                  if (
                    !resolvedRequest.startsWith('./') &&
                    !resolvedRequest.startsWith('../')
                  ) {
                    resolvedRequest = `./${resolvedRequest}`;
                  }
                  return {
                    path: resolvedRequest,
                    isResolved: true,
                  };
                }
                // NOTE: If request is a phantom dependency, which means it can be resolved but not specified in dependencies or peerDependencies in package.json, the output will be incorrect to use when the package is published
                // return the original request instead of the resolved request
                return {
                  path: undefined,
                  isResolved: true,
                };
              } catch (_e) {
                // catch error when request can not be resolved by resolver
                // e.g. A react component library importing and using 'react' but while not defining
                // it in devDependencies and peerDependencies. Preserve 'react' as-is if so.
                logger.debug(
                  `Failed to resolve module ${color.green(`"${request}"`)} from ${color.green(issuer)}. If it's an npm package, consider adding it to dependencies or peerDependencies in package.json to make it externalized.`,
                );
                // return origin request instead of undefined for cssExternalHandler
                return {
                  path: request,
                  isResolved: false,
                };
              }
            }

            // Issuer is not empty string when the module is imported by another module.
            // Prevent from externalizing entry modules here.
            if (issuer) {
              let resolvedRequest: string = request;

              const { path: redirectedPath, isResolved } =
                await redirectPath(resolvedRequest);
              const cssExternal = await cssExternalHandler(
                resolvedRequest,
                callback,
                jsExtension,
                cssModulesAuto,
                styleRedirectPath,
                styleRedirectExtension,
                redirectedPath,
                issuer,
              );

              if (cssExternal !== false) {
                return cssExternal;
              }

              if (redirectedPath === undefined) {
                callback(undefined, request);
                return;
              }

              if (jsRedirectPath) {
                resolvedRequest = redirectedPath;
              }

              // Node.js ECMAScript module loader does no extension searching.
              // Add a file extension according to autoExtension config
              // when data.request is a relative path and do not have an extension.
              // If data.request already have an extension, we replace it with new extension
              // This may result in a change in semantics,
              // user should use copy to keep origin file or use another separate entry to deal this
              if (resolvedRequest.startsWith('.') && isResolved) {
                const ext = extname(resolvedRequest);

                if (ext) {
                  // 1. js files hit JS_EXTENSIONS_PATTERN, ./foo.ts -> ./foo.mjs
                  if (JS_EXTENSIONS_PATTERN.test(resolvedRequest)) {
                    resolvedRequest = resolvedRequest.replace(
                      /\.[^.]+$/,
                      jsRedirectExtension
                        ? jsExtension
                        : JS_EXTENSIONS_PATTERN.test(originExtension)
                          ? originExtension
                          : '',
                    );
                  } else {
                    // 2. asset files, does not match jsExtensionsPattern, eg: ./foo.png -> ./foo.mjs
                    // non-js && non-css files
                    resolvedRequest = assetRedirectPath
                      ? redirectedPath
                      : request;

                    if (assetRedirectExtension) {
                      resolvedRequest = resolvedRequest.replace(
                        /\.[^.]+$/,
                        jsExtension,
                      );
                    }
                  }
                } else {
                  // 1. js files hit JS_EXTENSIONS_PATTERN,./foo ->./foo.mjs
                  if (jsRedirectExtension) {
                    // If the import path refers to a directory,
                    // it most likely actually refers to a `index.*` file due to Node's module resolution.
                    // When redirect.js.path is set to false, index should still be added before adding extension.
                    // When redirect.js.path is set to true, the resolver directly generates correct resolvedRequest with index appended.
                    if (
                      !jsRedirectPath &&
                      (await isDirectory(
                        join(dirname(issuer), resolvedRequest),
                      ))
                    ) {
                      // This uses `/` instead of `path.join` here because `join` removes potential "./" prefixes
                      resolvedRequest = `${resolvedRequest.replace(/\/+$/, '')}/index`;
                    }
                    resolvedRequest = `${resolvedRequest}${jsExtension}`;
                  }
                }
              }

              callback(undefined, resolvedRequest);
              return;
            }

            callback();
          },
        ] as Rspack.ExternalItem[],
      },
    },
  };
};

const composeDtsConfig = async (
  libConfig: LibConfig,
  format: Format,
  dtsExtension: string,
): Promise<EnvironmentConfig> => {
  const { autoExternal, banner, footer, redirect } = libConfig;

  let { dts } = libConfig;

  if (dts === false || dts === undefined) return {};

  // DTS default to bundleless whether js is bundle or not
  if (dts === true) {
    dts = {
      bundle: false,
    };
  }

  const { pluginDts } = await import('rsbuild-plugin-dts');
  return {
    plugins: [
      pluginDts({
        // Only setting ⁠dts.bundle to true will generate the bundled d.ts.
        bundle: dts?.bundle,
        distPath: dts?.distPath,
        build: dts?.build,
        abortOnError: dts?.abortOnError,
        dtsExtension: dts?.autoExtension ? dtsExtension : '.d.ts',
        autoExternal: getAutoExternalDefaultValue(format, autoExternal),
        alias: dts?.alias,
        banner: banner?.dts,
        footer: footer?.dts,
        redirect: redirect?.dts,
        tsgo: dts?.tsgo,
      }),
    ],
  };
};

const composeTargetConfig = (
  userTarget: RsbuildConfigOutputTarget,
  format: Format,
): {
  config: EnvironmentConfig;
  externalsConfig: EnvironmentConfig;
  target: RsbuildConfigOutputTarget;
} => {
  const target = userTarget ?? (format === 'mf' ? 'web' : 'node');
  switch (target) {
    case 'web':
      return {
        config: {
          tools: {
            rspack: {
              target: ['web'],
            },
          },
        },
        target: 'web',
        externalsConfig: {},
      };
    case 'node':
      return {
        config: {
          tools: {
            rspack: {
              externalsPresets: {
                node: false,
              },
              target: ['node'],
            },
          },
          output: {
            target: 'node',
          },
        },
        target: 'node',
        externalsConfig: {
          output: {
            // When output.target is 'node', Node.js's built-in will be treated as externals of type `node-commonjs`.
            // Simply override the built-in modules to make them external.
            // https://github.com/webpack/webpack/blob/dd44b206a9c50f4b4cb4d134e1a0bd0387b159a3/lib/node/NodeTargetPlugin.js#L81
            externals: nodeBuiltInModules,
          },
        },
      };
    // TODO: Support `neutral` target, however Rsbuild don't list it as an option in the target field.
    // case 'neutral':
    //   return {
    //     tools: {
    //       rspack: {
    //         target: ['web', 'node'],
    //       },
    //     },
    //   };
    default:
      throw new Error(`Unsupported platform: ${target}`);
  }
};

const composeExternalHelpersConfig = (
  externalHelpers: boolean,
  pkgJson?: PkgJson,
) => {
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

async function composeLibRsbuildConfig(
  config: LibConfig,
  multiCompilerIndex: number | null, // null means there's non multi-compiler
  root = process.cwd(),
  sharedPlugins?: RsbuildPlugins,
) {
  checkMFPlugin(config, sharedPlugins);

  const pkgJson = readPackageJson(root);
  const { compilerOptions } = await loadTsconfig(
    root,
    config.source?.tsconfigPath,
  );
  const cssModulesAuto = config.output?.cssModules?.auto ?? true;

  const {
    format = 'esm',
    shims,
    bundle = true,
    banner = {},
    footer = {},
    autoExtension = true,
    autoExternal,
    externalHelpers = false,
    redirect = {},
    umdName,
    experiments,
  } = config;
  const advancedEsm = experiments?.advancedEsm;
  const { rsbuildConfig: bundleConfig } = composeBundleConfig(bundle);
  const { rsbuildConfig: shimsConfig, enabledShims } = composeShimsConfig(
    format,
    shims,
  );
  const formatConfig = composeFormatConfig({
    format,
    pkgJson: pkgJson!,
    bundle,
    umdName,
    enabledShims,
    advancedEsm: advancedEsm ?? false,
  });
  const externalHelpersConfig = composeExternalHelpersConfig(
    externalHelpers,
    pkgJson,
  );
  const userExternalsConfig = composeExternalsConfig(
    format,
    config.output?.externals,
  );
  const {
    config: outputFilenameConfig,
    jsExtension,
    dtsExtension,
  } = composeOutputFilenameConfig(
    config,
    format,
    autoExtension,
    multiCompilerIndex,
    pkgJson,
  );

  const { entryConfig, outBase } = await composeEntryConfig(
    config.source?.entry!,
    config.bundle,
    root,
    cssModulesAuto,
    config.outBase,
  );

  const { config: bundlelessExternalConfig } = composeBundlelessExternalConfig(
    jsExtension,
    redirect,
    cssModulesAuto,
    bundle,
    outBase,
  );
  const {
    config: targetConfig,
    externalsConfig: targetExternalsConfig,
    target,
  } = composeTargetConfig(config.output?.target, format);
  const syntaxConfig = composeSyntaxConfig(target, config?.syntax);
  const autoExternalConfig = composeAutoExternalConfig({
    bundle,
    format,
    autoExternal,
    pkgJson,
    userExternals: config.output?.externals,
  });
  const cssConfig = composeCssConfig(
    outBase,
    cssModulesAuto,
    config.bundle,
    banner?.css,
    footer?.css,
  );
  const assetConfig = composeAssetConfig(bundle, format);

  const entryChunkConfig = composeEntryChunkConfig({
    useLoader: advancedEsm !== true && (format === 'esm' || format === 'iife'),
    enabledImportMetaUrlShim: enabledShims.cjs['import.meta.url'],
    contextToWatch: outBase,
  });
  const dtsConfig = await composeDtsConfig(config, format, dtsExtension);
  const externalsWarnConfig = composeExternalsWarnConfig(
    format,
    userExternalsConfig?.output?.externals,
    autoExternalConfig?.output?.externals,
  );
  const minifyConfig = composeMinifyConfig(config);
  const bannerFooterConfig = composeBannerFooterConfig(banner, footer);
  const decoratorsConfig = composeDecoratorsConfig(
    compilerOptions,
    config.source?.decorators?.version,
  );
  const printFileSizeConfig = composePrintFileSizeConfig(bundle, target);

  return mergeRsbuildConfig(
    bundleConfig,
    formatConfig,
    // outputConfig,
    shimsConfig,
    syntaxConfig,
    externalHelpersConfig,
    outputFilenameConfig,
    targetConfig,
    // #region Externals configs
    // The order of the externals config should come in the following order:
    // 1. `externalsWarnConfig` should come before other externals config to touch the externalized modules first.
    // 2. `userExternalsConfig` should present at first to takes effect earlier than others.
    // 3. The externals config in `bundlelessExternalConfig` should present after other externals config as
    //    it relies on other externals config to bail out the externalized modules first then resolve
    //    the correct path for relative imports.
    externalsWarnConfig,
    userExternalsConfig,
    autoExternalConfig,
    targetExternalsConfig,
    bundlelessExternalConfig,
    // #endregion
    entryConfig,
    cssConfig,
    assetConfig,
    entryChunkConfig,
    minifyConfig,
    dtsConfig,
    bannerFooterConfig,
    decoratorsConfig,
    printFileSizeConfig,
  );
}

export async function composeCreateRsbuildConfig(
  rslibConfig: RslibConfig,
): Promise<RsbuildConfigWithLibInfo[]> {
  const constantRsbuildConfig = await createConstantRsbuildConfig();
  const {
    lib: libConfigsArray,
    mode: _mode,
    root,
    plugins: sharedPlugins,
    dev: _dev,
    server: _server,
    logLevel,
    ...sharedRsbuildConfig
  } = rslibConfig;
  // debug mode should always verbose logs
  if (logLevel && !isDebug()) {
    logger.level = logLevel;
  }

  if (!Array.isArray(libConfigsArray) || libConfigsArray.length === 0) {
    throw new Error(
      `Expect "lib" field to be a non-empty array, but got: ${color.cyan(
        JSON.stringify(libConfigsArray),
      )}.`,
    );
  }

  const libConfigPromises = libConfigsArray.map(async (libConfig, index) => {
    const userConfig = mergeRsbuildConfig<LibConfig>(
      sharedRsbuildConfig,
      libConfig,
    );

    // Merge the configuration of each environment based on the shared Rsbuild
    // configuration and Lib configuration in the settings.
    const libRsbuildConfig = await composeLibRsbuildConfig(
      userConfig,
      libConfigsArray.length > 1 ? index : null,
      root,
      sharedPlugins,
    );

    // Reset certain fields because they will be completely overridden by the upcoming merge.
    // We don't want to retain them in the final configuration.
    // The reset process should occur after merging the library configuration.
    userConfig.source ??= {};
    userConfig.source.entry = {};

    // Already manually sort and merge the externals configuration.
    userConfig.output ??= {};
    delete userConfig.output.externals;

    const config: RsbuildConfigWithLibInfo = {
      format: libConfig.format ?? 'esm',
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
        omit<LibConfig, keyof LibOnlyConfig>(userConfig, {
          id: true,
          bundle: true,
          format: true,
          autoExtension: true,
          autoExternal: true,
          redirect: true,
          syntax: true,
          externalHelpers: true,
          banner: true,
          footer: true,
          dts: true,
          shims: true,
          umdName: true,
          outBase: true,
          experiments: true,
        }),
      ),
    };

    if (typeof libConfig.id === 'string') {
      config.id = libConfig.id;
    }

    return config;
  });

  const composedRsbuildConfig = await Promise.all(libConfigPromises);
  return composedRsbuildConfig;
}

export async function composeRsbuildEnvironments(
  rslibConfig: RslibConfig,
): Promise<{
  environments: Record<string, EnvironmentConfig>;
  environmentWithInfos: RequireKey<RsbuildConfigWithLibInfo, 'id'>[];
}> {
  const rsbuildConfigWithLibInfo =
    await composeCreateRsbuildConfig(rslibConfig);
  const environmentWithInfos: RequireKey<RsbuildConfigWithLibInfo, 'id'>[] = [];

  // User provided ids should take precedence over generated ids.
  const usedIds = rsbuildConfigWithLibInfo
    .map(({ id }) => id)
    .filter(Boolean as any as ExcludesFalse);
  const environments: RsbuildConfig['environments'] = {};
  const formatCount: Record<Format, number> = rsbuildConfigWithLibInfo.reduce(
    (acc, { format }) => {
      acc[format] = (acc[format] ?? 0) + 1;
      return acc;
    },
    {} as Record<Format, number>,
  );

  const composeDefaultId = (format: Format): string => {
    const nextDefaultId = (format: Format, index: number) => {
      return `${format}${formatCount[format] === 1 && index === 0 ? '' : index}`;
    };

    let index = 0;
    let candidateId = nextDefaultId(format, index);
    while (usedIds.indexOf(candidateId) !== -1) {
      candidateId = nextDefaultId(format, ++index);
    }
    usedIds.push(candidateId);
    return candidateId;
  };

  for (const { format, id, config } of rsbuildConfigWithLibInfo) {
    const libId = typeof id === 'string' ? id : composeDefaultId(format);
    environments[libId] = config;
    environmentWithInfos.push({ id: libId, format, config });
  }

  const conflictIds = usedIds.filter(
    (id, index) => usedIds.indexOf(id) !== index,
  );
  if (conflictIds.length) {
    throw new Error(
      `The following ids are duplicated: ${conflictIds.map((id) => `"${id}"`).join(', ')}. Please change the "lib.id" to be unique.`,
    );
  }

  return { environments, environmentWithInfos };
}

export const pruneEnvironments = (
  environments: Record<string, EnvironmentConfig>,
  libs?: string[],
): Record<string, EnvironmentConfig> => {
  if (!libs || libs.length === 0) {
    return environments;
  }

  const filteredEnvironments = Object.fromEntries(
    Object.entries(environments).filter(([name]) => libs.includes(name)),
  );

  if (Object.keys(filteredEnvironments).length === 0) {
    throw new Error(
      `The following libs are not found: ${libs.map((lib) => `"${lib}"`).join(', ')}.`,
    );
  }

  return filteredEnvironments;
};
