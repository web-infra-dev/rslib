import { join } from 'node:path';
import stripAnsi from 'strip-ansi';
import { buildAndGetResults, proxyConsole } from 'test-helper';
import { expect, test } from 'vitest';
import { composeModuleImportWarn } from '../../../packages/core/src/config';

test('auto external default should works', async () => {
  const fixturePath = join(__dirname, 'default');
  const { js, dts } = await buildAndGetResults({ fixturePath, type: 'all' });

  expect(js.entries.esm).toContain(
    'import * as __WEBPACK_EXTERNAL_MODULE_react__ from "react"',
  );

  expect(js!.entries.cjs).toContain(
    'const external_react_namespaceObject = require("react");',
  );

  // dts should externalized
  expect(dts.entries.esm).toContain("import type { oraPromise } from 'ora';");
  expect(dts.entries.cjs).toContain("import type { oraPromise } from 'ora';");
});

test('auto external sub path should works', async () => {
  const fixturePath = join(__dirname, 'external-sub-path');
  const { entries } = await buildAndGetResults({ fixturePath });

  expect(entries.esm).toContain(
    'import * as __WEBPACK_EXTERNAL_MODULE_react__ from "react"',
  );
  expect(entries.esm).toContain(
    'import * as __WEBPACK_EXTERNAL_MODULE_react_jsx_runtime_225474f2__ from "react/jsx-runtime"',
  );

  expect(entries.cjs).toContain(
    'const external_react_namespaceObject = require("react");',
  );
  expect(entries.cjs).toContain(
    'const jsx_runtime_namespaceObject = require("react/jsx-runtime");',
  );
});

test('auto external false should works', async () => {
  const fixturePath = join(__dirname, 'false');
  const { js, dts } = await buildAndGetResults({ fixturePath, type: 'all' });

  expect(js.entries.esm).not.toContain(
    'import * as __WEBPACK_EXTERNAL_MODULE_react__ from "react"',
  );

  expect(js.entries.cjs).not.toContain(
    'var external_react_namespaceObject = require("react");',
  );

  // dts should bundled
  expect(dts.entries.esm).toContain('export declare function oraPromise');
  expect(dts.entries.cjs).toContain('export declare function oraPromise');
});

test('externals should overrides auto external', async () => {
  const fixturePath = join(__dirname, 'with-externals');
  const { entries } = await buildAndGetResults({ fixturePath });

  expect(entries.esm).toContain(
    'import * as __WEBPACK_EXTERNAL_MODULE_react1__ from "react1"',
  );

  expect(entries.cjs).toContain(
    'const external_react1_namespaceObject = require("react1");',
  );
});

test('should get warn when use require in ESM', async () => {
  const { logs, restore } = proxyConsole();
  const fixturePath = join(__dirname, 'module-import-warn');
  const { entries } = await buildAndGetResults({ fixturePath });
  const logStrings = logs.map((log) => stripAnsi(log));

  expect(entries.esm).toContain(
    'import * as __WEBPACK_EXTERNAL_MODULE_react__ from "react"',
  );

  expect(
    logStrings.some((l) =>
      l.includes(stripAnsi(composeModuleImportWarn('react'))),
    ),
  ).toBe(true);

  restore();
});
