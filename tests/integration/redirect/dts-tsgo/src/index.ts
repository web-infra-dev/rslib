import { logRequest } from '@src/logger';
import { logger } from 'prebundle-pkg';
import type { Baz } from 'self-entry';
import type { LoggerOptions } from './types';
import { defaultOptions } from './types.js';

import sources = require('@src/logger');

export {
  sources,
  type Baz as self,
  logRequest,
  logger,
  type LoggerOptions,
  defaultOptions,
};

export * from '@src/foo';
export * from '@src/logger';
export type { Foo } from '@src/types';
export * from 'prebundle-pkg';
// export { Router } from 'express';
export type * from 'prebundle-types';
export type { Bar } from 'types';
export * from './.hidden';
export * from './.hidden-folder';
export * from './a.b';
export * from './bar.baz';
export * from './config';
export * from './foo';
export * from './types';
