import type { LogLevel, RsbuildConfig } from '@rsbuild/core';
import type { ParsedCommandLine } from 'typescript6-api';
import type { ApiExtractorOptions, PluginDtsOptions } from './options';

export type DtsGenerationBackend = 'api-old' | 'ts7-executable' | 'isolated';

export type DtsEntry = {
  name: string;
  path: string;
};

export type CompilerApiTsconfigResultForApi = ParsedCommandLine;
export type GetTsconfigTsconfigResultForExecutable = Pick<
  CompilerApiTsconfigResultForApi,
  'options'
>;

export type DtsTsconfigResult =
  CompilerApiTsconfigResultForApi | GetTsconfigTsconfigResultForExecutable;

export type DtsGenOptions = Omit<
  PluginDtsOptions,
  'bundle' | 'isolated' | 'tsgo'
> & {
  bundle: boolean;
  name: string;
  cwd: string;
  isWatch: boolean;
  dtsEntry: DtsEntry[];
  dtsEmitPath: string;
  tsconfigPath: string;
  tsConfigResult: DtsTsconfigResult;
  userExternals?: NonNullable<RsbuildConfig['output']>['externals'];
  apiExtractorOptions?: ApiExtractorOptions;
  loggerLevel: LogLevel;
  dtsBackend: DtsGenerationBackend;
};
