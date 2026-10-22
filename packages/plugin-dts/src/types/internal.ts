import type { LogLevel, RsbuildConfig } from '@rsbuild/core';
import type { ParsedCommandLine } from 'typescript6-api';
import type { ApiExtractorOptions, PluginDtsOptions } from './options';

export type DtsGenerationBackend =
  'api-old' | 'api-new' | 'ts7-executable' | 'isolated';

export type DtsEntry = {
  name: string;
  path: string;
};

export type OldApiTsconfigResult = ParsedCommandLine;
export type TsconfigOptionsResult = Pick<OldApiTsconfigResult, 'options'> & {
  contentMappers?: unknown[];
};

export type DtsTsconfigResult = OldApiTsconfigResult | TsconfigOptionsResult;

export type DtsGenOptions = Omit<
  PluginDtsOptions,
  'bundle' | 'isolated' | 'tsgo'
> & {
  bundle: boolean;
  name: string;
  cwd: string;
  isWatch: boolean;
  fileChanges?: { changed: string[]; created: string[]; deleted: string[] };
  dtsEntry: DtsEntry[];
  dtsEmitPath: string;
  build?: boolean;
  tsconfigPath: string;
  bundleTsconfigPath: string;
  tsConfigResult: DtsTsconfigResult;
  userExternals?: NonNullable<RsbuildConfig['output']>['externals'];
  apiExtractorOptions?: ApiExtractorOptions;
  loggerLevel: LogLevel;
  dtsBackend: DtsGenerationBackend;
};

export type DtsWatchDependencies = {
  dependencies: string[];
  directories: string[];
};

export type DtsWatchResult = DtsWatchDependencies & {
  status: 'success' | 'error';
};
