import { logger, type RsbuildConfig } from '@rsbuild/core';
import fs from 'node:fs';
import { join } from 'node:path';
import type { PluginDtsOptions } from './types/options';

const isObject = (obj: unknown): obj is Record<string, any> =>
  Object.prototype.toString.call(obj) === '[object Object]';

export const DEFAULT_EXCLUDED_PACKAGES: string[] = ['@types/react'];

type CalculateBundledPackagesOptions = {
  cwd: string;
  autoExternal: PluginDtsOptions['autoExternal'];
  userExternals?: NonNullable<RsbuildConfig['output']>['externals'];
  overrideBundledPackages?: string[];
};

// use !externals
export const calcBundledPackages = (
  options: CalculateBundledPackagesOptions,
): string[] => {
  const { cwd, autoExternal, userExternals, overrideBundledPackages } = options;

  if (overrideBundledPackages) {
    return overrideBundledPackages;
  }

  let pkgJson: {
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
  };

  try {
    const content = fs.readFileSync(join(cwd, 'package.json'), 'utf-8');
    pkgJson = JSON.parse(content);
  } catch {
    logger.warn(
      'The type of third-party packages will not be bundled due to read package.json failed',
    );
    return [];
  }

  const externalOptions = autoExternal
    ? {
        dependencies: true,
        peerDependencies: true,
        optionalDependencies: true,
        devDependencies: false,
        ...(autoExternal === true ? {} : autoExternal),
      }
    : {
        dependencies: false,
        peerDependencies: false,
        optionalDependencies: false,
        devDependencies: false,
      };

  // User externals should not bundled
  // Only handle the case where the externals type is string / (string | RegExp)[] / plain object, function type is too complex.
  const forcedBundledPackages = new Set<string>();
  const getUserExternalsKeys = (
    value: typeof userExternals,
  ): (string | RegExp)[] => {
    if (!value) {
      return [];
    }

    if (typeof value === 'string' || value instanceof RegExp) {
      return [value];
    }

    if (Array.isArray(value)) {
      return value.flatMap((v) => getUserExternalsKeys(v));
    }

    if (isObject(value)) {
      const keys: string[] = [];
      for (const [key, external] of Object.entries(value)) {
        if (external === false) {
          forcedBundledPackages.add(key);
        } else {
          keys.push(key);
        }
      }
      return keys;
    }
    return [];
  };

  const externals: (string | RegExp)[] = getUserExternalsKeys(userExternals);

  const allDeps: string[] = [];

  for (const type of [
    'dependencies',
    'peerDependencies',
    'optionalDependencies',
    'devDependencies',
  ] as const) {
    const deps = pkgJson[type] && Object.keys(pkgJson[type]);
    if (deps) {
      if (externalOptions[type]) {
        externals.push(
          ...deps.filter((dep) => !forcedBundledPackages.has(dep)),
        );
      }
      allDeps.push(...deps);
    }
  }

  const bundledPackages = allDeps.filter(
    (d) =>
      !externals.some((e) => (typeof e === 'string' ? d === e : e.test(d))),
  );

  const filteredBundledPackages = Array.from(new Set(bundledPackages)).filter(
    (pkg) => !DEFAULT_EXCLUDED_PACKAGES.includes(pkg),
  );

  return filteredBundledPackages;
};
