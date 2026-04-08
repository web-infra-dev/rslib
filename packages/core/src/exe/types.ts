import type { EnvironmentConfig } from '@rsbuild/core';
import type {
  ExeArch,
  ExeOptions,
  ExePlatform,
  ExeTarget,
  Format,
  RsbuildConfigEntry,
  RsbuildConfigOutputTarget,
  SeaOptions,
} from '../types';

export type ExeTargetInput = string | ExeTarget;

export type NormalizedExeTarget = {
  arch: ExeArch;
  customBinaryPath?: string;
  fileName?: string;
  index: number;
  nodeVersion: string;
  outputPath?: string;
  platform: ExePlatform;
  seaOptions: SeaOptions;
  suffix: string | null;
};

export type ResolvedExeTarget = NormalizedExeTarget & {
  builderBinaryPath: string;
  executableBinaryPath: string;
};

export type ExePluginOptions = {
  targets: NormalizedExeTarget[];
  format: Extract<Format, 'esm' | 'cjs'>;
  root: string;
};

export type ComposeExeConfigOptions = {
  bundle: boolean;
  exe?: ExeOptions;
  format: Format;
  root: string;
  sourceEntry?: RsbuildConfigEntry;
  target: RsbuildConfigOutputTarget;
};

export type ComposedExeConfig = {
  config: EnvironmentConfig;
};

export type CommandResult = {
  stdout: string;
  stderr: string;
};
