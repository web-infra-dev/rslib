import fs from 'node:fs';
import { resolve } from 'node:path';
import type { Format } from 'src/types/config';
import { logger } from './logger';

export const getDefaultExtension = (options: {
  format: Format;
  root: string;
  autoExtension: boolean;
}): {
  jsExtension: string;
  dtsExtension: string;
  isModule?: boolean;
} => {
  const { format, root, autoExtension } = options;

  let jsExtension = '.js';
  let dtsExtension = '.d.ts';

  if (!autoExtension) {
    return {
      jsExtension,
      dtsExtension,
    };
  }

  const pkgJsonPath = resolve(root, './package.json');
  if (!fs.existsSync(pkgJsonPath)) {
    logger.warn(
      `package.json does not exist in ${pkgJsonPath}, autoExtension will not be applied.`,
    );
    return {
      jsExtension,
      dtsExtension,
    };
  }

  let isModule = false;

  try {
    const json = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    isModule = json.type === 'module';
  } catch (e) {
    logger.warn(
      `Failed to parse ${pkgJsonPath}, it might not be valid JSON, autoExtension will not be applied.`,
    );
    return {
      jsExtension,
      dtsExtension,
    };
  }

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
