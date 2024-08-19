import type { Format, PkgJson } from '../types';
import { logger } from './logger';

export const getDefaultExtension = (options: {
  format: Format;
  pkgJson?: PkgJson;
  autoExtension: boolean;
}): {
  jsExtension: string;
  dtsExtension: string;
  isModule?: boolean;
} => {
  const { format, pkgJson, autoExtension } = options;

  let jsExtension = '.js';
  let dtsExtension = '.d.ts';

  if (!autoExtension) {
    return {
      jsExtension,
      dtsExtension,
    };
  }

  if (!pkgJson) {
    logger.warn(
      'autoExtension configuration will not be applied due to read package.json failed',
    );
    return {
      jsExtension,
      dtsExtension,
    };
  }

  const isModule = pkgJson.type === 'module';

  if (isModule && format === 'cjs') {
    jsExtension = '.cjs';
    dtsExtension = '.d.cts';
  }

  if (!isModule && format === 'esm') {
    jsExtension = '.mjs';
    dtsExtension = '.d.mts';
  }

  return {
    jsExtension,
    dtsExtension,
    isModule,
  };
};
