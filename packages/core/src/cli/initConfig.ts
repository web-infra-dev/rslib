import path from 'node:path';
import util from 'node:util';
import { loadEnv, type RsbuildEntry } from '@rsbuild/core';
import { loadConfig } from '../config';
import type {
  LibConfig,
  RsbuildConfigOutputTarget,
  RslibConfig,
} from '../types';
import { getAbsolutePath } from '../utils/helper';
import { logger } from '../utils/logger';
import type { BuildOptions, CommonOptions } from './commands';
import { onBeforeRestart } from './restart';

const shouldPrintSerializedRslibConfig = (): boolean => {
  if (!process.env.DEBUG) {
    return false;
  }

  const values = process.env.DEBUG.toLocaleLowerCase().split(',');
  return ['rslib'].some((key) => values.includes(key));
};

const getEnvDir = (cwd: string, envDir?: string) => {
  if (envDir) {
    return path.isAbsolute(envDir) ? envDir : path.resolve(cwd, envDir);
  }
  return cwd;
};

export const parseEntryOption = (
  entries?: string[],
): Record<string, string> | undefined => {
  if (!entries?.length) return undefined;

  const entryList: { key: string; value: string; explicit: boolean }[] = [];

  for (const rawEntry of entries) {
    const value = rawEntry?.trim();
    if (!value) continue;

    const equalIndex = value.indexOf('=');
    if (equalIndex > -1) {
      const name = value.slice(0, equalIndex).trim();
      const entryPath = value.slice(equalIndex + 1).trim();
      if (name && entryPath) {
        entryList.push({ key: name, value: entryPath, explicit: true });
        continue;
      }
    }

    const basename = path.basename(value, path.extname(value));
    entryList.push({ key: basename, value, explicit: false });
  }

  const keyCount: Record<string, number> = {};
  for (const { key, explicit } of entryList) {
    if (!explicit) keyCount[key] = (keyCount[key] ?? 0) + 1;
  }

  const keyIndex: Record<string, number> = {};
  const parsed: Record<string, string> = {};

  for (const { key, value, explicit } of entryList) {
    const needsIndex = !explicit && (keyCount[key] ?? 0) > 1;
    const finalKey = needsIndex ? `${key}${keyIndex[key] ?? 0}` : key;
    if (needsIndex) keyIndex[key] = (keyIndex[key] ?? 0) + 1;
    parsed[finalKey] = value;
  }

  return Object.keys(parsed).length ? parsed : undefined;
};

export const applyCliOptions = (
  config: RslibConfig,
  options: BuildOptions,
  root: string,
): void => {
  if (options.root) config.root = root;
  if (options.logLevel) config.logLevel = options.logLevel;

  for (const lib of config.lib) {
    if (options.format !== undefined) lib.format = options.format;
    if (options.bundle !== undefined) lib.bundle = options.bundle;
    if (options.tsconfig !== undefined) {
      lib.source ||= {};
      lib.source.tsconfigPath = options.tsconfig;
    }
    const entry = parseEntryOption(options.entry);
    if (entry !== undefined) {
      lib.source ||= {};
      lib.source.entry = entry as RsbuildEntry;
    }
    const syntax = options.syntax;
    if (syntax !== undefined) lib.syntax = syntax;
    if (options.dts !== undefined) lib.dts = options.dts;
    if (options.autoExtension !== undefined)
      lib.autoExtension = options.autoExtension;
    if (options.autoExternal !== undefined)
      lib.autoExternal = options.autoExternal;
    lib.output ??= {};
    if (options.target !== undefined)
      lib.output.target = options.target as RsbuildConfigOutputTarget;
    if (options.minify !== undefined) lib.output.minify = options.minify;
    if (options.clean !== undefined) lib.output.cleanDistPath = options.clean;
    const externals = options.externals?.filter(Boolean) ?? [];
    if (externals.length > 0) lib.output.externals = externals;
    if (options.distPath) {
      lib.output.distPath = {
        ...(typeof lib.output.distPath === 'object' ? lib.output.distPath : {}),
        root: options.distPath,
      };
    }
  }
};

export async function initConfig(options: CommonOptions): Promise<{
  config: RslibConfig;
  configFilePath?: string;
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

  if (configFilePath === undefined) {
    config.lib = [{} satisfies LibConfig];
    logger.debug(
      'No config file found. Falling back to CLI options for the default library.',
    );
  }

  config.source ||= {};
  config.source.define = {
    ...envs.publicVars,
    ...config.source.define,
  };

  applyCliOptions(config, options, root);

  // only debug serialized rslib config when DEBUG=rslib
  if (shouldPrintSerializedRslibConfig()) {
    logger.debug('Rslib config used to generate Rsbuild environments:');
    logger.debug(`\n${util.inspect(config, { depth: null, colors: true })}`);
  }

  return {
    config,
    configFilePath,
    watchFiles: [configFilePath, ...envs.filePaths].filter(Boolean) as string[],
  };
}
