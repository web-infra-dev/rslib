import path from 'node:path';
import { beforeAll, describe, expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';

describe.skipIf(process.version.startsWith('v18'))(
  'dts redirect with tsgo',
  () => {
    let contents: Awaited<ReturnType<typeof buildAndGetResults>>['contents'];

    beforeAll(async () => {
      const fixturePath = path.resolve(__dirname, './dts-tsgo');
      contents = (await buildAndGetResults({ fixturePath, type: 'dts' }))
        .contents;
    }, 20000);

    test('redirect.dts.path: true with redirect.dts.extension: false - default', async () => {
      expect(contents.esm0).toMatchInlineSnapshot(`
        {
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/default/esm/.hidden-folder/index.d.ts": "export declare const hiddenFolder = "This is a hidden folder";
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/default/esm/.hidden.d.ts": "export declare const hidden = "This is a hidden file";
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/default/esm/a.b/index.d.ts": "export declare const ab = "a.b";
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/default/esm/bar.baz.d.ts": "export declare const bar = "bar-baz";
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/default/esm/foo/foo.d.ts": "import { logRequest } from '../logger';
        import { logger } from '../../../../compile/prebundle-pkg';
        import { logRequest as logRequest2 } from '../logger';
        export { logRequest, logRequest2, logger };
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/default/esm/foo/index.d.ts": "export type Barrel = string;
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/default/esm/index.d.ts": "import { logRequest } from './logger';
        import { logger } from '../../../compile/prebundle-pkg';
        import type { Baz } from './';
        import type { LoggerOptions } from './types';
        import { defaultOptions } from './types.js';
        import sources = require('./logger');
        export { sources, type Baz as self, logRequest, logger, type LoggerOptions, defaultOptions, };
        export * from './foo';
        export * from './logger';
        export type { Foo } from './types';
        export * from '../../../compile/prebundle-pkg';
        export type { Bar } from './types';
        export * from './.hidden';
        export * from './.hidden-folder';
        export * from './a.b';
        export * from './bar.baz';
        export * from './foo';
        export * from './types';
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/default/esm/logger.d.ts": "import type { LoggerOptions } from './types';
        export declare function logRequest(req: Request, options: LoggerOptions): void;
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/default/esm/types.d.ts": "export interface LoggerOptions {
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
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/path-false/esm/.hidden-folder/index.d.ts": "export declare const hiddenFolder = "This is a hidden folder";
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/path-false/esm/.hidden.d.ts": "export declare const hidden = "This is a hidden file";
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/path-false/esm/a.b/index.d.ts": "export declare const ab = "a.b";
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/path-false/esm/bar.baz.d.ts": "export declare const bar = "bar-baz";
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/path-false/esm/foo/foo.d.ts": "import { logRequest } from '@src/logger';
        import { logger } from 'prebundle-pkg';
        import { logRequest as logRequest2 } from '../logger';
        export { logRequest, logRequest2, logger };
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/path-false/esm/foo/index.d.ts": "export type Barrel = string;
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/path-false/esm/index.d.ts": "import { logRequest } from '@src/logger';
        import { logger } from 'prebundle-pkg';
        import type { Baz } from 'self-entry';
        import type { LoggerOptions } from './types';
        import { defaultOptions } from './types.js';
        import sources = require('@src/logger');
        export { sources, type Baz as self, logRequest, logger, type LoggerOptions, defaultOptions, };
        export * from '@src/foo';
        export * from '@src/logger';
        export type { Foo } from '@src/types';
        export * from 'prebundle-pkg';
        export type { Bar } from 'types';
        export * from './.hidden';
        export * from './.hidden-folder';
        export * from './a.b';
        export * from './bar.baz';
        export * from './foo';
        export * from './types';
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/path-false/esm/logger.d.ts": "import type { LoggerOptions } from './types';
        export declare function logRequest(req: Request, options: LoggerOptions): void;
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/path-false/esm/types.d.ts": "export interface LoggerOptions {
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
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/extension-true/esm/.hidden-folder/index.d.ts": "export declare const hiddenFolder = "This is a hidden folder";
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/extension-true/esm/.hidden.d.ts": "export declare const hidden = "This is a hidden file";
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/extension-true/esm/a.b/index.d.ts": "export declare const ab = "a.b";
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/extension-true/esm/bar.baz.d.ts": "export declare const bar = "bar-baz";
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/extension-true/esm/foo/foo.d.ts": "import { logRequest } from '../logger.js';
        import { logger } from '../../../../compile/prebundle-pkg';
        import { logRequest as logRequest2 } from '../logger.js';
        export { logRequest, logRequest2, logger };
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/extension-true/esm/foo/index.d.ts": "export type Barrel = string;
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/extension-true/esm/index.d.ts": "import { logRequest } from './logger.js';
        import { logger } from '../../../compile/prebundle-pkg';
        import type { Baz } from './index.js';
        import type { LoggerOptions } from './types.js';
        import { defaultOptions } from './types.js';
        import sources = require('./logger.js');
        export { sources, type Baz as self, logRequest, logger, type LoggerOptions, defaultOptions, };
        export * from './foo/index.js';
        export * from './logger.js';
        export type { Foo } from './types.js';
        export * from '../../../compile/prebundle-pkg';
        export type { Bar } from './types.js';
        export * from './.hidden.js';
        export * from './.hidden-folder/index.js';
        export * from './a.b/index.js';
        export * from './bar.baz.js';
        export * from './foo/index.js';
        export * from './types.js';
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/extension-true/esm/logger.d.ts": "import type { LoggerOptions } from './types.js';
        export declare function logRequest(req: Request, options: LoggerOptions): void;
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/extension-true/esm/types.d.ts": "export interface LoggerOptions {
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
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/path-false-extension-true/esm/.hidden-folder/index.d.ts": "export declare const hiddenFolder = "This is a hidden folder";
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/path-false-extension-true/esm/.hidden.d.ts": "export declare const hidden = "This is a hidden file";
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/path-false-extension-true/esm/a.b/index.d.ts": "export declare const ab = "a.b";
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/path-false-extension-true/esm/bar.baz.d.ts": "export declare const bar = "bar-baz";
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/path-false-extension-true/esm/foo/foo.d.ts": "import { logRequest } from '@src/logger';
        import { logger } from 'prebundle-pkg';
        import { logRequest as logRequest2 } from '../logger.js';
        export { logRequest, logRequest2, logger };
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/path-false-extension-true/esm/foo/index.d.ts": "export type Barrel = string;
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/path-false-extension-true/esm/index.d.ts": "import { logRequest } from '@src/logger';
        import { logger } from 'prebundle-pkg';
        import type { Baz } from 'self-entry';
        import type { LoggerOptions } from './types.js';
        import { defaultOptions } from './types.js';
        import sources = require('@src/logger');
        export { sources, type Baz as self, logRequest, logger, type LoggerOptions, defaultOptions, };
        export * from '@src/foo';
        export * from '@src/logger';
        export type { Foo } from '@src/types';
        export * from 'prebundle-pkg';
        export type { Bar } from 'types';
        export * from './.hidden.js';
        export * from './.hidden-folder/index.js';
        export * from './a.b/index.js';
        export * from './bar.baz.js';
        export * from './foo/index.js';
        export * from './types.js';
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/path-false-extension-true/esm/logger.d.ts": "import type { LoggerOptions } from './types.js';
        export declare function logRequest(req: Request, options: LoggerOptions): void;
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/path-false-extension-true/esm/types.d.ts": "export interface LoggerOptions {
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
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/auto-extension-true/esm/.hidden-folder/index.d.mts": "export declare const hiddenFolder = "This is a hidden folder";
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/auto-extension-true/esm/.hidden.d.mts": "export declare const hidden = "This is a hidden file";
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/auto-extension-true/esm/a.b/index.d.mts": "export declare const ab = "a.b";
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/auto-extension-true/esm/bar.baz.d.mts": "export declare const bar = "bar-baz";
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/auto-extension-true/esm/foo/foo.d.mts": "import { logRequest } from '../logger.mjs';
        import { logger } from '../../../../compile/prebundle-pkg';
        import { logRequest as logRequest2 } from '../logger.mjs';
        export { logRequest, logRequest2, logger };
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/auto-extension-true/esm/foo/index.d.mts": "export type Barrel = string;
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/auto-extension-true/esm/index.d.mts": "import { logRequest } from './logger.mjs';
        import { logger } from '../../../compile/prebundle-pkg';
        import type { Baz } from './index.mjs';
        import type { LoggerOptions } from './types.mjs';
        import { defaultOptions } from './types.mjs';
        import sources = require('./logger.mjs');
        export { sources, type Baz as self, logRequest, logger, type LoggerOptions, defaultOptions, };
        export * from './foo/index.mjs';
        export * from './logger.mjs';
        export type { Foo } from './types.mjs';
        export * from '../../../compile/prebundle-pkg';
        export type { Bar } from './types.mjs';
        export * from './.hidden.mjs';
        export * from './.hidden-folder/index.mjs';
        export * from './a.b/index.mjs';
        export * from './bar.baz.mjs';
        export * from './foo/index.mjs';
        export * from './types.mjs';
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/auto-extension-true/esm/logger.d.mts": "import type { LoggerOptions } from './types.mjs';
        export declare function logRequest(req: Request, options: LoggerOptions): void;
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/auto-extension-true/esm/types.d.mts": "export interface LoggerOptions {
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
      expect(contents.cjs).toMatchInlineSnapshot(`
        {
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/auto-extension-true/cjs/.hidden-folder/index.d.ts": "export declare const hiddenFolder = "This is a hidden folder";
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/auto-extension-true/cjs/.hidden.d.ts": "export declare const hidden = "This is a hidden file";
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/auto-extension-true/cjs/a.b/index.d.ts": "export declare const ab = "a.b";
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/auto-extension-true/cjs/bar.baz.d.ts": "export declare const bar = "bar-baz";
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/auto-extension-true/cjs/foo/foo.d.ts": "import { logRequest } from '../logger.js';
        import { logger } from '../../../../compile/prebundle-pkg';
        import { logRequest as logRequest2 } from '../logger.js';
        export { logRequest, logRequest2, logger };
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/auto-extension-true/cjs/foo/index.d.ts": "export type Barrel = string;
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/auto-extension-true/cjs/index.d.ts": "import { logRequest } from './logger.js';
        import { logger } from '../../../compile/prebundle-pkg';
        import type { Baz } from './index.js';
        import type { LoggerOptions } from './types.js';
        import { defaultOptions } from './types.js';
        import sources = require('./logger.js');
        export { sources, type Baz as self, logRequest, logger, type LoggerOptions, defaultOptions, };
        export * from './foo/index.js';
        export * from './logger.js';
        export type { Foo } from './types.js';
        export * from '../../../compile/prebundle-pkg';
        export type { Bar } from './types.js';
        export * from './.hidden.js';
        export * from './.hidden-folder/index.js';
        export * from './a.b/index.js';
        export * from './bar.baz.js';
        export * from './foo/index.js';
        export * from './types.js';
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/auto-extension-true/cjs/logger.d.ts": "import type { LoggerOptions } from './types.js';
        export declare function logRequest(req: Request, options: LoggerOptions): void;
        ",
          "<ROOT>/tests/integration/redirect/dts-tsgo/dist/auto-extension-true/cjs/types.d.ts": "export interface LoggerOptions {
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
  },
);
