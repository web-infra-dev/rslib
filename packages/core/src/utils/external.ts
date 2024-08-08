import type { RsbuildConfig } from '@rsbuild/core';
import type { PkgJson } from '../types';
import type { AutoExternal } from '../types/config';
import { logger } from './logger';

export const composeAutoExternalConfig = (options: {
  autoExternal: AutoExternal;
  pkgJson?: PkgJson;
  userExternals?: NonNullable<RsbuildConfig['output']>['externals'];
}): RsbuildConfig => {
  const { autoExternal, pkgJson, userExternals } = options;

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

  // User externals configuration has higher priority than autoExternal
  // eg: autoExternal: ['react'], user: output: { externals: { react: 'react-1' } }
  // Only handle the case where the externals type is object, string / string[] does not need to be processed, other types are too complex.
  const userExternalKeys =
    userExternals &&
    Object.prototype.toString.call(userExternals) === '[object Object]'
      ? Object.keys(userExternals)
      : [];

  const externals = (
    ['dependencies', 'peerDependencies', 'devDependencies'] as const
  )
    .reduce<string[]>((prev, type) => {
      if (externalOptions[type]) {
        return pkgJson[type] ? prev.concat(Object.keys(pkgJson[type]!)) : prev;
      }
      return prev;
    }, [])
    .filter((name) => !userExternalKeys.includes(name));

  return externals.length
    ? {
        output: {
          externals,
        },
      }
    : {};
};
