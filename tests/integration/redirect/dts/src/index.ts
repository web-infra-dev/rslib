import { logRequest } from '@src/logger';
import { logger } from 'rslog';
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
export * from 'rslog';
export type { Bar } from 'types';
export * from './foo';
export * from './types';
