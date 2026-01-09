import type {
  EnvironmentConfig,
  OutputConfig,
  RsbuildConfig,
  Rspack,
} from '@rsbuild/core';
import type { GetAsyncFunctionFromUnion } from './utils';

export type Format = 'esm' | 'cjs' | 'umd' | 'mf' | 'iife';

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
  config: EnvironmentConfig;
};

export type RsbuildConfigEntry = NonNullable<
  NonNullable<EnvironmentConfig['source']>['entry']
>;
export type RsbuildConfigEntryItem = RsbuildConfigEntry[string];
export type RspackResolver = GetAsyncFunctionFromUnion<
  ReturnType<NonNullable<Rspack.ExternalItemFunctionData['getResolve']>>
>;

export type RsbuildConfigOutputTarget = NonNullable<
  EnvironmentConfig['output']
>['target'];

export type Syntax =
  // ECMAScript versions as an common used addition to browserslist query
  | EcmaScriptVersion
  // Support inline browserslist query, like defined in package.json
  | string[];

export type Dts =
  | {
      /**
       * Whether to bundle the declaration files.
       * @defaultValue `false`
       * @see {@link https://rslib.rs/config/lib/dts#dtsbundle}
       */
      bundle?:
        | boolean
        | {
            /**
             * Specifies the dependencies whose declaration files should be bundled.
             * @defaultValue {@link https://rslib.rs/config/lib/dts#dtsbundlebundledpackages}
             * @see {@link https://rslib.rs/config/lib/dts#dtsbundlebundledpackages}
             */
            bundledPackages?: string[];
          };
      /**
       * The output directory of declaration files.
       * @defaultValue {@link https://rslib.rs/config/lib/dts#default-value}
       * @see {@link https://rslib.rs/config/lib/dts#dtsdistpath}
       */
      distPath?: string;
      /**
       * Whether to generate declaration files with building the project references.
       * @defaultValue `false`
       * @see {@link https://rslib.rs/config/lib/dts#dtsbuild}
       */
      build?: boolean;
      /**
       * Whether to abort the build process when an error occurs during declaration files generation.
       * @defaultValue `true`
       * @see {@link https://rslib.rs/config/lib/dts#dtsabortonerror}
       */
      abortOnError?: boolean;
      /**
       * Whether to automatically set the declaration file extension based on the {@link format} option.
       * @defaultValue `false`
       * @see {@link https://rslib.rs/config/lib/dts#dtsautoextension}
       */
      autoExtension?: boolean;
      /**
       * Set the alias for declaration files, similar to the `compilerOptions.paths` option in `tsconfig.json`.
       * @defaultValue `{}`
       * @see {@link https://rslib.rs/config/lib/dts#dtsalias}
       */
      alias?: Record<string, string>;
      /**
       * Whether to generate declaration files with `tsgo`.
       * @experimental
       * @defaultValue `false`
       * @see {@link https://rslib.rs/config/lib/dts#dtstsgo}
       */
      tsgo?: boolean;
    }
  | boolean;

export type AutoExternal =
  | boolean
  | {
      /**
       * Whether to automatically externalize dependencies of type `dependencies`.
       * @defaultValue `true`
       * @see {@link https://rslib.rs/config/lib/auto-external#autoexternaldependencies}
       */
      dependencies?: boolean;
      /**
       * Whether to automatically externalize dependencies of type `optionalDependencies`.
       * @defaultValue `true`
       * @see {@link https://rslib.rs/config/lib/auto-external#autoexternaloptionaldependencies}
       */
      optionalDependencies?: boolean;
      /**
       * Whether to automatically externalize dependencies of type `peerDependencies`.
       * @defaultValue `true`
       * @see {@link https://rslib.rs/config/lib/auto-external#autoexternalpeerdependencies}
       */
      peerDependencies?: boolean;
      /**
       * Whether to automatically externalize dependencies of type `devDependencies`.
       * @defaultValue `false`
       * @see {@link https://rslib.rs/config/lib/auto-external#autoexternaldevdependencies}
       */
      devDependencies?: boolean;
    };

export type BannerAndFooter = {
  js?: string;
  css?: string;
  dts?: string;
};

export type Shims = {
  /**
   * Configure the shims for CommonJS output.
   * @see {@link https://rslib.rs/config/lib/shims#shimscjs}
   */
  cjs?: {
    /**
     * Whether to inject shims for the `import.meta.url` in CommonJS output.
     * @defaultValue `true`
     * @see {@link https://rslib.rs/config/lib/shims#shimscjsimportmetaurl}
     */
    'import.meta.url'?: boolean;
    /**
     * Whether to inject shims for the `import.meta.dirname` in CommonJS output.
     * @defaultValue `true`
     * @see {@link https://rslib.rs/config/lib/shims#shimscjsimportmetadirname}
     */
    'import.meta.dirname'?: boolean;
    /**
     * Whether to inject shims for the `import.meta.filename` in CommonJS output.
     * @defaultValue `true`
     * @see {@link https://rslib.rs/config/lib/shims#shimscjsimportmetafilename}
     */
    'import.meta.filename'?: boolean;
  };
  /**
   * Configure the shims for ESM output.
   * @see {@link https://rslib.rs/config/lib/shims#shimsesm}
   */
  esm?: {
    /**
     * Whether to inject shims for the global `__filename` of CommonJS in ESM output.
     * @defaultValue `false`
     * @see {@link https://rslib.rs/config/lib/shims#shimsesm__filename}
     */
    __filename?: boolean;
    /**
     * Whether to inject shims for the global `__dirname` of CommonJS in ESM output.
     * @defaultValue `false`
     * @see {@link https://rslib.rs/config/lib/shims#shimsesm__dirname}
     */
    __dirname?: boolean;
    /**
     * Whether to inject shims for the global `require` of CommonJS in ESM output.
     * @defaultValue `false`
     * @see {@link https://rslib.rs/config/lib/shims#shimsesmrequire}
     */
    require?: boolean;
  };
};

export type JsRedirect = {
  /**
   * Whether to automatically redirect the import paths of JavaScript output files.
   * @defaultValue `true`
   */
  path?: boolean;
  /**
   * Whether to automatically redirect the file extension to import paths based on the JavaScript output files.
   * @defaultValue `true`
   */
  extension?: boolean;
};

export type StyleRedirect = {
  /**
   * Whether to automatically redirect the import paths of style output files.
   * @defaultValue `true`
   */
  path?: boolean;
  /**
   * Whether to automatically redirect the file extension to import paths based on the style output files.
   * @defaultValue `true`
   */
  extension?: boolean;
};

export type AssetRedirect = {
  /**
   * Whether to automatically redirect the import paths of asset output files.
   * @defaultValue `true`
   */
  path?: boolean;
  /**
   * Whether to automatically redirect the file extension to import paths based on the asset output files.
   * @defaultValue `true`
   */
  extension?: boolean;
};

export type DtsRedirect = {
  /**
   * Whether to automatically redirect the import paths of TypeScript declaration output files.
   * @defaultValue `true`
   */
  path?: boolean;
  /**
   * Whether to automatically redirect the file extension to import paths based on the TypeScript declaration output files.
   * @defaultValue `false`
   */
  extension?: boolean;
};

export type Redirect = {
  /** Controls the redirect of the import paths of output JavaScript files. */
  js?: JsRedirect;
  /** Controls the redirect of the import paths of output style files. */
  style?: StyleRedirect;
  /** Controls the redirect of the import paths of output asset files. */
  asset?: AssetRedirect;
  /** Controls the redirect of the import paths of output TypeScript declaration files. */
  dts?: DtsRedirect;
};

export type LibExperiments = {
  /**
   * Whether to enable Rspack advanced ESM output.
   * @defaultValue `true`
   * @see {@link https://rslib.rs/config/lib/experiments#experimentsadvancedesm}
   */
  advancedEsm?: boolean;
};

export interface LibConfig extends EnvironmentConfig {
  /**
   * The unique identifier of the library.
   * @defaultValue `undefined`
   * @see {@link https://rslib.rs/config/lib/id}
   */
  id?: string;
  /**
   * Output format for the generated JavaScript files.
   * @defaultValue `'esm'`
   * @see {@link https://rslib.rs/config/lib/format}
   */
  format?: Format;
  /**
   * Whether to bundle the library.
   * @defaultValue `true`
   * @see {@link https://rslib.rs/config/lib/bundle}
   */
  bundle?: boolean;
  /**
   * Whether to automatically set the file extension based on {@link format} option in the JavaScript output files.
   * @defaultValue `true`
   * @see {@link https://rslib.rs/config/lib/auto-extension}
   */
  autoExtension?: boolean;
  /**
   * Whether to automatically externalize dependencies of different dependency types and do not bundle them.
   * @defaultValue `true` when {@link format} is `cjs` or `esm`, `false` when {@link format} is `umd` or `mf`.
   * @see {@link https://rslib.rs/config/lib/auto-external}
   */
  autoExternal?: AutoExternal;
  /**
   * Configure the redirect of the import paths, applicable {@link bundle} is set to `false`.
   * @defaultValue `{}`
   * @see {@link https://rslib.rs/config/lib/redirect}
   */
  redirect?: Redirect;
  /**
   * Configure the syntax to which JavaScript and CSS will be downgraded.
   * @defaultValue `'esnext'`
   * @see {@link https://rslib.rs/config/lib/syntax}
   */
  syntax?: Syntax;
  /**
   * Whether to import SWC helper functions from `@swc/helpers` instead of inlining them.
   * @defaultValue `false`
   * @see {@link https://rslib.rs/config/lib/external-helpers}
   */
  externalHelpers?: boolean;
  /**
   * Inject content into the top of each JavaScript, CSS or declaration file.
   * @defaultValue `{}`
   * @see {@link https://rslib.rs/config/lib/banner}
   */
  banner?: BannerAndFooter;
  /**
   * Inject content into the bottom of each JavaScript, CSS or declaration file.
   * @defaultValue `{}`
   * @see {@link https://rslib.rs/config/lib/footer}
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
   *     'import.meta.dirname': true,
   *     'import.meta.filename': true,
   *   },
   *   esm: {
   *     __filename: false,
   *     __dirname: false,
   *     require: false,
   *   },
   * };
   * ```
   * @see {@link https://rslib.rs/config/lib/shims}
   */
  shims?: Shims;
  /**
   * Configure the generation of the TypeScript declaration files.
   * @defaultValue `false`
   * @see {@link https://rslib.rs/config/lib/dts}
   */
  dts?: Dts;
  /**
   * The export name of the UMD bundle.
   * @defaultValue `undefined`
   * @see {@link https://rslib.rs/config/lib/umd-name}
   */
  umdName?: Rspack.LibraryName;
  /**
   * The base directory of the output files.
   * @defaultValue `undefined`
   * @see {@link https://rslib.rs/config/lib/out-base}
   */
  outBase?: string;
  /**
   * @inheritdoc
   */
  output?: RslibOutputConfig;
  /**
   * Options for experimental features.
   * @defaultValue `{}`
   * @see {@link https://rslib.rs/config/lib/experiments}
   */
  experiments?: LibExperiments;
}

export type LibOnlyConfig = Omit<LibConfig, keyof EnvironmentConfig>;

interface RslibOutputConfig extends OutputConfig {
  /**
   * @override
   * @default 'node'
   */
  target?: OutputConfig['target'];
  /**
   * @override
   * @default false
   */
  filenameHash?: OutputConfig['filenameHash'];
  /**
   * @override
   * When minify is not specified, Rslib will use a sane default for minify options.
   * The default options will only perform dead code elimination and unused code elimination.
   *
   * @see {@link https://rslib.rs/config/rsbuild/output#outputminify}
   */
  minify?: OutputConfig['minify'];
}

export interface RslibConfig extends RsbuildConfig {
  lib: LibConfig[];
  /**
   * @inheritdoc
   */
  output?: RslibOutputConfig;
  /**
   * @private
   */
  _privateMeta?: {
    configFilePath: string;
    envFilePaths?: string[];
  };
}
