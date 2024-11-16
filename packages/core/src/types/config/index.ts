import type { RsbuildConfig } from '@rsbuild/core';
import type { PluginDtsOptions } from 'rsbuild-plugin-dts';

export type Format = 'esm' | 'cjs' | 'umd' | 'mf';

export type FixedEcmaVersions =
  | 'es5'
  | 'es6'
  | 'es2015'
  | 'es2016'
  | 'es2017'
  | 'es2018'
  | 'es2019'
  | 'es2020'
  | 'es2021'
  | 'es2022'
  | 'es2023';
export type LatestEcmaVersions = 'es2024' | 'esnext';
export type EcmaScriptVersion = FixedEcmaVersions | LatestEcmaVersions;

export type RsbuildConfigOutputTarget = NonNullable<
  RsbuildConfig['output']
>['target'];

export type Syntax =
  // ECMAScript versions as an common used addition to browserslist query
  | EcmaScriptVersion
  // Support inline browserslist query, like defined in package.json
  | string[];

export type Dts =
  | (Pick<
      PluginDtsOptions,
      'bundle' | 'distPath' | 'abortOnError' | 'build'
    > & {
      autoExtension?: boolean;
    })
  | boolean;

export type AutoExternal =
  | boolean
  | {
      dependencies?: boolean;
      optionalDependencies?: boolean;
      devDependencies?: boolean;
      peerDependencies?: boolean;
    };

export type BannerAndFooter = {
  js?: string;
  css?: string;
  dts?: string;
};

export type Shims = {
  cjs?: {
    'import.meta.url'?: boolean;
  };
  esm?: {
    __filename?: boolean;
    __dirname?: boolean;
    require?: boolean;
  };
};

export type Redirect = {
  // TODO: support other redirects
  // alias?: boolean;
  style?: boolean;
  // asset?: boolean;
  // autoExtension?: boolean;
};

export interface LibConfig extends RsbuildConfig {
  /**
   * Each lib configuration has a unique identifier used to distinguish different lib configurations.
   * By default, Rslib generates a unique identifier based on the order of lib configurations, in the format `${format}${index}`.
   * When there is only one lib of the format, the index is empty, otherwise, it starts from 0 and increments.
   * For example:
   * - If only ESM and CJS formats are configured, the identifier for ESM is `esm` and for CJS is `cjs`.
   * - If two ESM formats and one CJS format are configured, they are represented as `esm0`, `esm1`, and `cjs`.
   * @default undefined
   */
  id?: string;
  /**
   * Output format for the generated JavaScript files.
   * @default undefined
   */
  format?: Format;
  /**
   * Whether to bundle the library.
   * @default true
   */
  bundle?: boolean;
  /**
   * Whether to automatically set the file extension based on the `format` option in the JavaScript output files.
   * @default true
   */
  autoExtension?: boolean;
  /**
   * Whether to automatically externalize dependencies of different dependency types and do not bundle them.
   * @default true
   */
  autoExternal?: AutoExternal;
  /**
   * Configure the redirect of the import paths, applicable when `bundle: false`.
   * @default {}
   */
  redirect?: Redirect;
  /**
   * Configure the syntax to which JavaScript and CSS will be downgraded.
   * Support ECMAScript version and browserslist query.
   * @default 'esnext'
   */
  syntax?: Syntax;
  /**
   * Whether to import SWC helper functions from `@swc/helpers` instead of inlining them.
   * @default false
   */
  externalHelpers?: boolean;
  /**
   * Inject content into the top of each JS, CSS or DTS file.
   * @default {}
   */
  banner?: BannerAndFooter;
  /**
   * Inject content into the bottom of each JS, CSS or DTS file.
   * @default {}
   */
  footer?: BannerAndFooter;
  /**
   * Configure the shims for CommonJS and ESM output.
   *
   * @default
   * ```js
   * const defaultShims = {
   *   cjs: {
   *     'import.meta.url': true,
   *   },
   *   esm: {
   *     __filename: false,
   *     __dirname: false,
   *     require: false,
   *   },
   * };
   * ```
   */
  shims?: Shims;
  /**
   * Configure the generation of the TypeScript declaration files.
   * @default false
   */
  dts?: Dts;
  /**
   * The export name of the UMD bundle.
   * @default undefined
   */
  umdName?: string;
}

export type LibOnlyConfig = Omit<LibConfig, keyof RsbuildConfig>;

export interface RslibConfig extends RsbuildConfig {
  lib: LibConfig[];
}

export type ConfigParams = {
  env: string;
  command: string;
  envMode?: string;
};

export type RslibConfigSyncFn = (env: ConfigParams) => RslibConfig;
export type RslibConfigAsyncFn = (env: ConfigParams) => Promise<RslibConfig>;
export type RslibConfigExport =
  | RslibConfig
  | RslibConfigSyncFn
  | RslibConfigAsyncFn;
