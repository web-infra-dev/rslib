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
  | (Pick<PluginDtsOptions, 'bundle' | 'distPath' | 'abortOnError'> & {
      autoExtension?: boolean;
    })
  | false;

export type AutoExternal =
  | boolean
  | {
      dependencies?: boolean;
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
  bundle?: boolean;
  format?: Format;
  autoExtension?: boolean;
  autoExternal?: AutoExternal;
  redirect?: Redirect;
  /** Support esX and browserslist query */
  syntax?: Syntax;
  externalHelpers?: boolean;
  banner?: BannerAndFooter;
  footer?: BannerAndFooter;
  shims?: Shims;
  dts?: Dts;
}

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
