import path from 'node:path';
import util from 'node:util';
import { loadEnv, type RsbuildEntry } from '@rsbuild/core';
import { loadConfig } from '../config';
import type {
  EcmaScriptVersion,
  RsbuildConfigOutputTarget,
  RslibConfig,
  Syntax,
} from '../types';
import { getAbsolutePath } from '../utils/helper';
import { logger } from '../utils/logger';
import type { CommonOptions } from './commands';
import { onBeforeRestart } from './restart';

const getEnvDir = (cwd: string, envDir?: string) => {
  if (envDir) {
    return path.isAbsolute(envDir) ? envDir : path.resolve(cwd, envDir);
  }
  return cwd;
};

export const parseEntryOption = (
  entries?: string[],
): Record<string, string> | undefined => {
  if (!entries || entries.length === 0) {
    return undefined;
  }

  const parsed: Record<string, string> = {};
  let unnamedIndex = 0;

  for (const rawEntry of entries) {
    const value = rawEntry?.trim();
    if (!value) {
      continue;
    }

    const equalIndex = value.indexOf('=');
    if (equalIndex > -1) {
      const name = value.slice(0, equalIndex).trim();
      const entryPath = value.slice(equalIndex + 1).trim();
      if (name && entryPath) {
        parsed[name] = entryPath;
        continue;
      }
    }

    unnamedIndex += 1;
    const key = unnamedIndex === 1 ? 'index' : `entry${unnamedIndex}`;
    parsed[key] = value;
  }

  return Object.keys(parsed).length === 0 ? undefined : parsed;
};

export const parseSyntaxOption = (syntax?: string): Syntax | undefined => {
  if (!syntax) {
    return undefined;
  }

  const trimmed = syntax.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      const reason = e instanceof Error ? e.message : String(e);
      throw new Error(
        `Failed to parse --syntax option "${trimmed}" as JSON array: ${reason}`,
      );
    }
  }

  return trimmed as EcmaScriptVersion;
};

const applyCliOptions = (
  config: RslibConfig,
  options: CommonOptions,
  root: string,
): void => {
  if (options.root) config.root = root;
  if (options.logLevel) config.logLevel = options.logLevel;

  for (const lib of config.lib) {
    if (options.format !== undefined) lib.format = options.format;
    if (options.bundle !== undefined) lib.bundle = options.bundle;
    if (options.dts !== undefined) lib.dts = options.dts;
    if (options.autoExtension !== undefined)
      lib.autoExtension = options.autoExtension;
    if (options.autoExternal !== undefined)
      lib.autoExternal = options.autoExternal;
    if (options.tsconfig !== undefined) {
      lib.source ||= {};
      lib.source.tsconfigPath = options.tsconfig;
    }
    const entry = parseEntryOption(options.entry);
    if (entry !== undefined) {
      lib.source ||= {};
      lib.source.entry = entry as RsbuildEntry;
    }
    const syntax = parseSyntaxOption(options.syntax);
    if (syntax !== undefined) lib.syntax = syntax;
    const output = lib.output ?? {};
    if (options.target !== undefined)
      output.target = options.target as RsbuildConfigOutputTarget;
    if (options.minify !== undefined) output.minify = options.minify;
    if (options.clean !== undefined) output.cleanDistPath = options.clean;
    const externals = options.external?.filter(Boolean) ?? [];
    if (externals.length > 0) output.externals = externals;
    if (options.distPath) {
      output.distPath ??= {};
      output.distPath.root = options.distPath;
    }
  }
};

export async function initConfig(options: CommonOptions): Promise<{
  config: RslibConfig;
  configFilePath: string;
  watchFiles: string[];
}> {
  const cwd = process.cwd();
  const root = options.root ? getAbsolutePath(cwd, options.root) : cwd;
  const envs = loadEnv({
    cwd: getEnvDir(root, options.envDir),
    mode: options.envMode,
  });

  onBeforeRestart(envs.cleanup);

  const { content: config, filePath: configFilePath } = await loadConfig({
    cwd: root,
    path: options.config,
    envMode: options.envMode,
    loader: options.configLoader,
  });

  config.source ||= {};
  config.source.define = {
    ...envs.publicVars,
    ...config.source.define,
  };

  applyCliOptions(config, options, root);

  logger.debug('Rslib config used to generate Rsbuild environments:');
  logger.debug(`\n${util.inspect(config, { depth: null, colors: true })}`);

  return {
    config,
    configFilePath,
    watchFiles: [configFilePath, ...envs.filePaths],
  };
}
