import type { RsbuildConfig } from '@rsbuild/core';
import type { PkgJson } from '../types';
import type { AutoExternal } from '../types/config';
import { logger } from './logger';

export const applyAutoExternal = (options: {
  autoExternal: AutoExternal;
  pkgJson?: PkgJson;
}): RsbuildConfig => {
  const { autoExternal, pkgJson } = options;

  if (!autoExternal) {
    return {};
  }

  if (!pkgJson) {
    logger.warn(
      'autoExternal configuration will not be applied due to read package.json failed',
    );
    return {};
  }

  const externalOptions = {
    dependencies: true,
    peerDependencies: true,
    devDependencies: false,
    ...(autoExternal === true ? {} : autoExternal),
  };

  const externals = (
    ['dependencies', 'peerDependencies', 'devDependencies'] as const
  ).reduce<string[]>((prev, type) => {
    if (externalOptions[type]) {
      return pkgJson[type] ? prev.concat(Object.keys(pkgJson[type]!)) : prev;
    }
    return prev;
  }, []);

  return externals.length
    ? {
        output: {
          externals,
        },
      }
    : {};
};
