import { logRequest } from '@src/logger';
import { logger } from 'prebundle-pkg';
import type { Baz } from 'self-entry';
import { fooMjs } from './foo.mjs';
import type { LoggerOptions } from './types';
import { defaultOptions } from './types.js';

type sources = typeof import('@src/logger');

export type InlineOptions = import('./types').LoggerOptions;
export type NestedFoo = Promise<Array<import('@src/types').Foo>>;

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

export type { Chart } from 'chart.js';
export type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
export type { EsmValue } from 'pkg/sub.mjs';
export type { CjsValue } from 'pkg/sub.cjs';

export type { Foo as PathFoo } from 'path-types.mjs';
