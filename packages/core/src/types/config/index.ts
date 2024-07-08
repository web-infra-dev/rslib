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
  // Use browserslist config file
  | 'browserslist'
  // ECMAScript versions as an common used addition to browserslist query
  | EcmaScriptVersion
  | EcmaScriptVersion[]
  // Support inline browserslist query, like defined in package.json
  | string[];

export interface LibConfig extends RsbuildConfig {
  format?: Format;
  autoExtension?: boolean;
  output?: RsbuildConfig['output'] & {
    /** Support esX and browserslist query */
    syntax?: Syntax;
  };
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
