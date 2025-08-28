import fs from 'node:fs';
import fsP from 'node:fs/promises';
import path, { isAbsolute, join } from 'node:path';
import type { RsbuildPlugins } from '@rsbuild/core';

import type { Format, LibConfig, PkgJson } from '../types';
import { color } from './color';
import { logger } from './logger';

/**
 * Node.js built-in modules.
 * Copied from https://github.com/webpack/webpack/blob/dd44b206a9c50f4b4cb4d134e1a0bd0387b159a3/lib/node/NodeTargetPlugin.js#L12-L72
 */
export const nodeBuiltInModules: (string | RegExp)[] = [
  'assert',
  'assert/strict',
  'async_hooks',
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'diagnostics_channel',
  'dns',
  'dns/promises',
  'domain',
  'events',
  'fs',
  'fs/promises',
  'http',
  'http2',
  'https',
  'inspector',
  'inspector/promises',
  'module',
  'net',
  'os',
  'path',
  'path/posix',
  'path/win32',
  'perf_hooks',
  'process',
  'punycode',
  'querystring',
  'readline',
  'readline/promises',
  'repl',
  'stream',
  'stream/consumers',
  'stream/promises',
  'stream/web',
  'string_decoder',
  'sys',
  'timers',
  'timers/promises',
  'tls',
  'trace_events',
  'tty',
  'url',
  'util',
  'util/types',
  'v8',
  'vm',
  'wasi',
  'worker_threads',
  'zlib',
  /^node:/,

  // cspell:word pnpapi
  // Yarn PnP adds pnpapi as "builtin"
  'pnpapi',
];

export async function calcLongestCommonPath(
  absPaths: string[],
): Promise<string | null> {
  if (absPaths.length === 0) {
    return null;
  }

  // we support two cases
  // 1. /packages-a/src/index.ts
  // 2. D:/packages-a/src/index.ts
  const sep = path.posix.sep as '/';

  const splitPaths = absPaths.map((p) => p.split(sep));
  let lcaFragments = splitPaths[0]!;
  for (let i = 1; i < splitPaths.length; i++) {
    const currentPath = splitPaths[i]!;
    const minLength = Math.min(lcaFragments.length, currentPath.length);

    let j = 0;
    while (j < minLength && lcaFragments[j] === currentPath[j]) {
      j++;
    }

    lcaFragments = lcaFragments.slice(0, j);
  }

  let lca = lcaFragments.length > 0 ? lcaFragments.join(sep) : sep;

  const stats = await fsP.stat(lca);
  if (stats?.isFile()) {
    lca = path.dirname(lca);
  }

  return lca;
}

export function getAbsolutePath(base: string, filepath: string): string {
  return isAbsolute(filepath) ? filepath : join(base, filepath);
}

export const readPackageJson = (rootPath: string): undefined | PkgJson => {
  const pkgJsonPath = path.join(rootPath, './package.json');

  if (!fs.existsSync(pkgJsonPath)) {
    logger.warn(
      `The \`package.json\` file does not exist in the ${rootPath} directory`,
    );
    return;
  }

  try {
    return JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  } catch (_err) {
    logger.warn(`Failed to parse ${pkgJsonPath}, it might not be valid JSON`);
    return;
  }
};

export const isObject = (obj: unknown): obj is Record<string, any> =>
  Object.prototype.toString.call(obj) === '[object Object]';

export const isEmptyObject = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

export function pick<T, U extends keyof T>(
  obj: T,
  keys: readonly U[],
): Pick<T, U> {
  return keys.reduce(
    (ret, key) => {
      if (obj[key] !== undefined) {
        ret[key] = obj[key];
      }
      return ret;
    },
    {} as Pick<T, U>,
  );
}

export function omit<T extends object, U extends keyof T>(
  obj: T,
  keysObj: Record<U, boolean>,
): Omit<T, keyof U> {
  type K = keyof U;
  return Object.keys(obj).reduce(
    (ret, key) => {
      if (keysObj[key as U] !== true) {
        ret[key as keyof Omit<T, K>] = obj[key as keyof Omit<T, K>];
      }
      return ret;
    },
    {} as Omit<T, K>,
  );
}

export function isPluginIncluded(
  pluginName: string,
  plugins?: RsbuildPlugins,
): boolean {
  return Boolean(
    plugins?.some((plugin) => {
      if (Array.isArray(plugin)) {
        return isPluginIncluded(pluginName, plugin);
      }
      if (typeof plugin === 'object' && plugin !== null && 'name' in plugin) {
        return plugin.name === pluginName;
      }
      return false;
    }),
  );
}

export function checkMFPlugin(
  config: LibConfig,
  sharedPlugins?: RsbuildPlugins,
): boolean {
  if (config.format !== 'mf') {
    return true;
  }

  // https://github.com/module-federation/core/blob/4e5c4b96ee45899f3ba5904b8927768980d5ad0e/packages/rsbuild-plugin/src/cli/index.ts#L17
  const added = isPluginIncluded('rsbuild:module-federation-enhanced', [
    ...(sharedPlugins || []),
    ...(config.plugins || []),
  ]);

  if (!added) {
    logger.warn(
      `${color.green('format: "mf"')} should be used with ${color.blue(
        '@module-federation/rsbuild-plugin',
      )}", consider installing and adding it to plugins. Check the documentation (https://module-federation.io/guide/basic/rsbuild.html#rslib-module) to get started with "mf" output.`,
    );
    process.exit(1);
  }
  return added;
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Check if running in a TTY context
 */
export const isTTY = (type: 'stdin' | 'stdout' = 'stdout'): boolean => {
  return (
    (type === 'stdin' ? process.stdin.isTTY : process.stdout.isTTY) &&
    !process.env.CI
  );
};

export const isIntermediateOutputFormat = (format: Format): boolean => {
  return format === 'cjs' || format === 'esm';
};

const windowsSlashRegex = /\\/g;
export function normalizeSlash(p: string): string {
  return p.replace(windowsSlashRegex, '/');
}

export async function isDirectory(filePath: string): Promise<boolean> {
  try {
    const stat = await fsP.stat(filePath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}
