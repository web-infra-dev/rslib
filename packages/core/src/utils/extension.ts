import fs from 'node:fs';
import { resolve } from 'node:path';
import type { Format } from 'src/types/config';
import { logger } from './logger';

export const getDefaultExtension = (options: {
  format: Format;
  root: string;
  autoExtension: boolean;
}) => {
  const { format, root, autoExtension } = options;

  let jsExtension = '.js';
  let dtsExtension = '.d.ts';

  if (!autoExtension) {
    return {
      jsExtension,
      dtsExtension,
    };
  }

  let isModule = false;

  try {
    const json = JSON.parse(
      fs.readFileSync(resolve(root, './package.json'), 'utf8'),
    );
    isModule = json.type === 'module';
  } catch (e) {
    logger.warn(`package.json is broken in ${root}`);
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
