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

export type RsbuildConfigWithLibInfo = {
  id?: string;
  format: Format;
  config: RsbuildConfig;
};

export type RsbuildConfigEntry = NonNullable<
  NonNullable<RsbuildConfig['source']>['entry']
>;
export type RsbuildConfigEntryItem = RsbuildConfigEntry[string];

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

export type JsRedirect = {
  /**
   * Whether to automatically redirect the import paths of JavaScript output files,
   * compilerOptions.paths in tsconfig.json will be applied by default.
   * @defaultValue `true`
   */
  path?: boolean;
  /**
   * Whether to automatically add the file extension based on the JavaScript output files.
   * @defaultValue `true`
   */
  extension?: boolean;
};

// @ts-expect-error TODO: support dts redirect in the future
type DtsRedirect = {
  path?: boolean;
  extension?: boolean;
};

export type Redirect = {
  /** Controls the redirect of the import paths of JavaScript output files. */
  js?: JsRedirect;
  style?: boolean;
  // TODO: support other redirects
  // asset?: boolean;
  // dts?: DtsRedirect;
};

export interface LibConfig extends RsbuildConfig {
  /**
   * The unique identifier of the library.
   * @defaultValue `undefined`
   * @see {@link https://lib.rsbuild.dev/config/lib/id}
   */
  id?: string;
  /**
   * Output format for the generated JavaScript files.
   * @defaultValue `undefined`
   * @see {@link https://lib.rsbuild.dev/config/lib/format}
   */
  format?: Format;
  /**
   * Whether to bundle the library.
   * @defaultValue `true`
   * @see {@link https://lib.rsbuild.dev/config/lib/bundle}
   */
  bundle?: boolean;
  /**
   * Whether to automatically set the file extension based on {@link format} option in the JavaScript output files.
   * @defaultValue `true`
   * @see {@link https://lib.rsbuild.dev/config/lib/auto-extension}
   */
  autoExtension?: boolean;
  /**
   * Whether to automatically externalize dependencies of different dependency types and do not bundle them.
   * @defaultValue `true` when {@link format} is `cjs` or `esm`, `false` when {@link format} is `umd` or `mf`.
   * @see {@link https://lib.rsbuild.dev/config/lib/auto-external}
   */
  autoExternal?: AutoExternal;
  /**
   * Configure the redirect of the import paths, applicable {@link bundle} is set to `false`.
   * @defaultValue `{}`
   * @see {@link https://lib.rsbuild.dev/config/lib/redirect}
   */
  redirect?: Redirect;
  /**
   * Configure the syntax to which JavaScript and CSS will be downgraded.
   * @defaultValue `'esnext'`
   * @see {@link https://lib.rsbuild.dev/config/lib/syntax}
   */
  syntax?: Syntax;
  /**
   * Whether to import SWC helper functions from `@swc/helpers` instead of inlining them.
   * @defaultValue `false`
   * @see {@link https://lib.rsbuild.dev/config/lib/external-helpers}
   */
  externalHelpers?: boolean;
  /**
   * Inject content into the top of each JavaScript, CSS or DTS file.
   * @defaultValue `{}`
   * @see {@link https://lib.rsbuild.dev/config/lib/banner}
   */
  banner?: BannerAndFooter;
  /**
   * Inject content into the bottom of each JavaScript, CSS or DTS file.
   * @defaultValue `{}`
   * @see {@link https://lib.rsbuild.dev/config/lib/footer}
   */
  footer?: BannerAndFooter;
  /**
   * Configure the shims for CommonJS and ESM output.
   *
   * @defaultValue
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
   * @see {@link https://lib.rsbuild.dev/config/lib/shims}
   */
  shims?: Shims;
  /**
   * Configure the generation of the TypeScript declaration files.
   * @defaultValue `false`
   * @see {@link https://lib.rsbuild.dev/config/lib/dts}
   */
  dts?: Dts;
  /**
   * The export name of the UMD bundle.
   * @defaultValue `undefined`
   * @see {@link https://lib.rsbuild.dev/config/lib/umd-name}
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
