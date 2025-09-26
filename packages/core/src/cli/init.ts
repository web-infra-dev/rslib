import path from 'node:path';
import { loadEnv } from '@rsbuild/core';
import { loadConfig } from '../config';
import type { LibConfig, LibOnlyConfig, RslibConfig } from '../types';
import { getAbsolutePath } from '../utils/helper';
import type { CommonOptions } from './commands';
import { onBeforeRestart } from './restart';

const getEnvDir = (cwd: string, envDir?: string) => {
  if (envDir) {
    return path.isAbsolute(envDir) ? envDir : path.resolve(cwd, envDir);
  }
  return cwd;
};

const parseEntryOption = (
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

const parseSyntaxOption = (syntax?: string): string | string[] | undefined => {
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

  return trimmed;
};

const applyCliFlags = (
  config: RslibConfig,
  options: CommonOptions,
  root: string,
) => {
  if (options.root) {
    config.root = root;
  }

  if (options.logLevel) {
    config.logLevel = options.logLevel;
  }

  if (options.tsconfig) {
    config.source ||= {};
    config.source.tsconfigPath = options.tsconfig;
  }

  const entry = parseEntryOption(options.entry);
  const syntax = parseSyntaxOption(options.syntax);

  const externals = options.external?.filter(Boolean) ?? [];

  for (const lib of config.lib) {
    if (options.format) {
      lib.format = options.format;
    }

    if (options.bundle !== undefined) {
      lib.bundle = options.bundle;
    }

    if (syntax !== undefined) {
      lib.syntax = syntax;
    }

    if (options.dts !== undefined) {
      lib.dts = options.dts;
    }

    if (options.autoExtension !== undefined) {
      lib.autoExtension = options.autoExtension;
    }

    if (options.autoExternal !== undefined) {
      lib.autoExternal = options.autoExternal;
    }

    if (entry) {
      lib.source = {
        ...(lib.source ?? {}),
        entry: { ...entry },
      } as LibConfig['source'];
    }

    if (
      options.target !== undefined ||
      options.minify !== undefined ||
      options.clean !== undefined ||
      externals.length > 0 ||
      options.distPath !== undefined
    ) {
      const output = (lib.output = {
        ...(lib.output ?? {}),
      });

      if (options.target) {
        output.target = options.target as NonNullable<
          LibOnlyConfig['output']
        >['target'];
      }

      if (options.minify !== undefined) {
        output.minify = options.minify;
      }

      if (options.clean !== undefined) {
        output.cleanDistPath = options.clean;
      }

      if (externals.length > 0) {
        const existing = output.externals;
        output.externals =
          existing === undefined
            ? [...externals]
            : Array.isArray(existing)
              ? [...existing, ...externals]
              : [existing, ...externals];
      }

      if (options.distPath) {
        const bundle = options.bundle ?? lib.bundle ?? true;

        if (bundle === false) {
          lib.outBase = options.distPath;
        } else {
          output.distPath = {
            ...(output.distPath ?? {}),
            root: options.distPath,
          };
        }
      }
    }
  }
};

export async function init(options: CommonOptions): Promise<{
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

  applyCliFlags(config, options, root);

  return {
    config,
    configFilePath,
    watchFiles: [configFilePath, ...envs.filePaths],
  };
}
