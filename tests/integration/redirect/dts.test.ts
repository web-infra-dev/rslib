import path from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { beforeAll, expect, test } from 'vitest';

let contents: Awaited<ReturnType<typeof buildAndGetResults>>['contents'];

beforeAll(async () => {
  const fixturePath = path.resolve(__dirname, './dts');
  contents = (await buildAndGetResults({ fixturePath, type: 'dts' })).contents;
}, 15000);

test('redirect.dts.path: true with redirect.dts.extension: false - default', async () => {
  expect(contents.esm0).toMatchInlineSnapshot(`
    {
      "<ROOT>/tests/integration/redirect/dts/dist/default/esm/foo/foo.d.ts": "import { logRequest } from '../logger';
    import { logger } from '../../../../compile/rslog';
    import { logRequest as logRequest2 } from '../logger';
    export { logRequest, logRequest2, logger };
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/default/esm/foo/index.d.ts": "export type Barrel = string;
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/default/esm/index.d.ts": "import { logRequest } from './logger';
    import { logger } from '../../../compile/rslog';
    import type { Baz } from './';
    import type { LoggerOptions } from './types';
    import { defaultOptions } from './types.js';
    import sources = require('./logger');
    export { sources, type Baz as self, logRequest, logger, type LoggerOptions, defaultOptions, };
    export type { Foo } from './types';
    export type { Bar } from './types';
    export * from './foo';
    export * from './foo';
    export * from './types';
    export * from '../../../compile/rslog';
    export * from './logger';
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/default/esm/logger.d.ts": "import type { Request } from 'express';
    import type { LoggerOptions } from './types';
    export declare function logRequest(req: Request, options: LoggerOptions): void;
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/default/esm/types.d.ts": "export interface LoggerOptions {
        logLevel: 'info' | 'debug' | 'warn' | 'error';
        logBody: boolean;
    }
    export declare const defaultOptions: LoggerOptions;
    export interface Foo {
        foo: string;
    }
    export interface Bar {
        bar: string;
    }
    export interface Baz {
        baz: string;
    }
    ",
    }
  `);
});

test('redirect.dts.path: false with redirect.dts.extension: false', async () => {
  expect(contents.esm1).toMatchInlineSnapshot(`
    {
      "<ROOT>/tests/integration/redirect/dts/dist/path-false/esm/foo/foo.d.ts": "import { logRequest } from '@src/logger';
    import { logger } from 'rslog';
    import { logRequest as logRequest2 } from '../logger';
    export { logRequest, logRequest2, logger };
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/path-false/esm/foo/index.d.ts": "export type Barrel = string;
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/path-false/esm/index.d.ts": "import { logRequest } from '@src/logger';
    import { logger } from 'rslog';
    import type { Baz } from 'self-entry';
    import type { LoggerOptions } from './types';
    import { defaultOptions } from './types.js';
    import sources = require('@src/logger');
    export { sources, type Baz as self, logRequest, logger, type LoggerOptions, defaultOptions, };
    export type { Foo } from '@src/types';
    export type { Bar } from 'types';
    export * from './foo';
    export * from '@src/foo';
    export * from './types';
    export * from 'rslog';
    export * from '@src/logger';
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/path-false/esm/logger.d.ts": "import type { Request } from 'express';
    import type { LoggerOptions } from './types';
    export declare function logRequest(req: Request, options: LoggerOptions): void;
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/path-false/esm/types.d.ts": "export interface LoggerOptions {
        logLevel: 'info' | 'debug' | 'warn' | 'error';
        logBody: boolean;
    }
    export declare const defaultOptions: LoggerOptions;
    export interface Foo {
        foo: string;
    }
    export interface Bar {
        bar: string;
    }
    export interface Baz {
        baz: string;
    }
    ",
    }
  `);
});

test('redirect.dts.path: true with redirect.dts.extension: true', async () => {
  expect(contents.esm2).toMatchInlineSnapshot(`
    {
      "<ROOT>/tests/integration/redirect/dts/dist/extension-true/esm/foo/foo.d.ts": "import { logRequest } from '../logger.js';
    import { logger } from '../../../../compile/rslog';
    import { logRequest as logRequest2 } from '../logger.js';
    export { logRequest, logRequest2, logger };
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/extension-true/esm/foo/index.d.ts": "export type Barrel = string;
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/extension-true/esm/index.d.ts": "import { logRequest } from './logger.js';
    import { logger } from '../../../compile/rslog';
    import type { Baz } from './index.js';
    import type { LoggerOptions } from './types.js';
    import { defaultOptions } from './types.js';
    import sources = require('./logger.js');
    export { sources, type Baz as self, logRequest, logger, type LoggerOptions, defaultOptions, };
    export type { Foo } from './types.js';
    export type { Bar } from './types.js';
    export * from './foo/index.js';
    export * from './foo/index.js';
    export * from './types.js';
    export * from '../../../compile/rslog';
    export * from './logger.js';
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/extension-true/esm/logger.d.ts": "import type { Request } from 'express';
    import type { LoggerOptions } from './types.js';
    export declare function logRequest(req: Request, options: LoggerOptions): void;
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/extension-true/esm/types.d.ts": "export interface LoggerOptions {
        logLevel: 'info' | 'debug' | 'warn' | 'error';
        logBody: boolean;
    }
    export declare const defaultOptions: LoggerOptions;
    export interface Foo {
        foo: string;
    }
    export interface Bar {
        bar: string;
    }
    export interface Baz {
        baz: string;
    }
    ",
    }
  `);
});

test('redirect.dts.path: false with dts.redirect.extension: true', async () => {
  expect(contents.esm3).toMatchInlineSnapshot(`
    {
      "<ROOT>/tests/integration/redirect/dts/dist/path-false-extension-true/esm/foo/foo.d.ts": "import { logRequest } from '@src/logger';
    import { logger } from 'rslog';
    import { logRequest as logRequest2 } from '../logger.js';
    export { logRequest, logRequest2, logger };
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/path-false-extension-true/esm/foo/index.d.ts": "export type Barrel = string;
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/path-false-extension-true/esm/index.d.ts": "import { logRequest } from '@src/logger';
    import { logger } from 'rslog';
    import type { Baz } from 'self-entry';
    import type { LoggerOptions } from './types.js';
    import { defaultOptions } from './types.js';
    import sources = require('@src/logger');
    export { sources, type Baz as self, logRequest, logger, type LoggerOptions, defaultOptions, };
    export type { Foo } from '@src/types';
    export type { Bar } from 'types';
    export * from './foo/index.js';
    export * from '@src/foo';
    export * from './types.js';
    export * from 'rslog';
    export * from '@src/logger';
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/path-false-extension-true/esm/logger.d.ts": "import type { Request } from 'express';
    import type { LoggerOptions } from './types.js';
    export declare function logRequest(req: Request, options: LoggerOptions): void;
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/path-false-extension-true/esm/types.d.ts": "export interface LoggerOptions {
        logLevel: 'info' | 'debug' | 'warn' | 'error';
        logBody: boolean;
    }
    export declare const defaultOptions: LoggerOptions;
    export interface Foo {
        foo: string;
    }
    export interface Bar {
        bar: string;
    }
    export interface Baz {
        baz: string;
    }
    ",
    }
  `);
});

test('redirect.dts.extension: true with dts.autoExtension: true', async () => {
  expect(contents.esm4).toMatchInlineSnapshot(`
    {
      "<ROOT>/tests/integration/redirect/dts/dist/auto-extension-true/foo/foo.d.mts": "import { logRequest } from '../logger.mjs';
    import { logger } from '../../../compile/rslog';
    import { logRequest as logRequest2 } from '../logger.mjs';
    export { logRequest, logRequest2, logger };
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/auto-extension-true/foo/foo.d.ts": "import { logRequest } from '../logger.js';
    import { logger } from '../../../compile/rslog';
    import { logRequest as logRequest2 } from '../logger.js';
    export { logRequest, logRequest2, logger };
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/auto-extension-true/foo/index.d.mts": "export type Barrel = string;
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/auto-extension-true/foo/index.d.ts": "export type Barrel = string;
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/auto-extension-true/index.d.mts": "import { logRequest } from './logger.mjs';
    import { logger } from '../../compile/rslog';
    import type { Baz } from './index.mjs';
    import type { LoggerOptions } from './types.mjs';
    import { defaultOptions } from './types.mjs';
    import sources = require('./logger.mjs');
    export { sources, type Baz as self, logRequest, logger, type LoggerOptions, defaultOptions, };
    export type { Foo } from './types.mjs';
    export type { Bar } from './types.mjs';
    export * from './foo/index.mjs';
    export * from './foo/index.mjs';
    export * from './types.mjs';
    export * from '../../compile/rslog';
    export * from './logger.mjs';
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/auto-extension-true/index.d.ts": "import { logRequest } from './logger.js';
    import { logger } from '../../compile/rslog';
    import type { Baz } from './index.js';
    import type { LoggerOptions } from './types.js';
    import { defaultOptions } from './types.js';
    import sources = require('./logger.js');
    export { sources, type Baz as self, logRequest, logger, type LoggerOptions, defaultOptions, };
    export type { Foo } from './types.js';
    export type { Bar } from './types.js';
    export * from './foo/index.js';
    export * from './foo/index.js';
    export * from './types.js';
    export * from '../../compile/rslog';
    export * from './logger.js';
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/auto-extension-true/logger.d.mts": "import type { Request } from 'express';
    import type { LoggerOptions } from './types.mjs';
    export declare function logRequest(req: Request, options: LoggerOptions): void;
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/auto-extension-true/logger.d.ts": "import type { Request } from 'express';
    import type { LoggerOptions } from './types.js';
    export declare function logRequest(req: Request, options: LoggerOptions): void;
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/auto-extension-true/types.d.mts": "export interface LoggerOptions {
        logLevel: 'info' | 'debug' | 'warn' | 'error';
        logBody: boolean;
    }
    export declare const defaultOptions: LoggerOptions;
    export interface Foo {
        foo: string;
    }
    export interface Bar {
        bar: string;
    }
    export interface Baz {
        baz: string;
    }
    ",
      "<ROOT>/tests/integration/redirect/dts/dist/auto-extension-true/types.d.ts": "export interface LoggerOptions {
        logLevel: 'info' | 'debug' | 'warn' | 'error';
        logBody: boolean;
    }
    export declare const defaultOptions: LoggerOptions;
    export interface Foo {
        foo: string;
    }
    export interface Bar {
        bar: string;
    }
    export interface Baz {
        baz: string;
    }
    ",
    }
  `);
});
