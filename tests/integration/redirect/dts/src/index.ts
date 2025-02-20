import { logRequest } from '@src/logger';
import { logger } from 'rslog';
import type { LoggerOptions } from './types';
import { defaultOptions } from './types.js';

export { logRequest, logger, type LoggerOptions, defaultOptions };

export type { Foo } from '@src/types';
export type { Bar } from 'types';
export * from './foo';
export * from '@src/foo';
export * from './types';
export * from 'rslog';
export * from '@src/logger';
