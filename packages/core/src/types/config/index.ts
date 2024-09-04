import type { RsbuildConfig } from '@rsbuild/core';

export type Format = 'esm' | 'cjs' | 'umd';

export type EcmaScriptVersion =
  | 'esnext'
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
  | 'es2023'
  | 'es2024';

export type Syntax =
  // ECMAScript versions as an common used addition to browserslist query
  | EcmaScriptVersion
  // Support inline browserslist query, like defined in package.json
  | string[];

export type Dts =
  | {
      bundle: boolean;
      distPath?: string;
      abortOnError?: boolean;
    }
  | false;

export type AutoExternal =
  | boolean
  | {
      dependencies?: boolean;
      devDependencies?: boolean;
      peerDependencies?: boolean;
    };

export interface LibConfig extends RsbuildConfig {
  bundle?: boolean;
  format?: Format;
  autoExtension?: boolean;
  autoExternal?: AutoExternal;
  /** Support esX and browserslist query */
  syntax?: Syntax;
  externalHelpers?: boolean;
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
