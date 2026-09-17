import { logRequest } from '@src/logger';
import { logger } from 'prebundle-pkg';
import type { Baz } from 'self-entry';
import { fooMjs } from './foo.mjs';
import type { LoggerOptions } from './types';
import { defaultOptions } from './types.js';

type sources = typeof import('@src/logger');

export {
  defaultOptions,
  fooMjs,
  logRequest,
  logger,
  sources,
  type LoggerOptions,
  type Baz as self,
};

export * from '@src/foo';
export * from '@src/logger';
export type { Foo } from '@src/types';
export { Router } from 'express';
export * from 'prebundle-pkg';
export type { Bar } from 'types';
export type { TypesValue } from 'types-pkg';
export * from './.hidden';
export * from './.hidden-folder';
export * from './a.b';
export * from './bar.baz';
export * from './config';
export * from './foo';
export * from './types';
