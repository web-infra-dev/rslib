import { join } from 'node:path';
import { buildAndGetResults } from '@e2e/helper';
import { expect, test } from 'vitest';

test('auto external default should works', async () => {
  const fixturePath = join(__dirname, 'default');
  const { entries } = await buildAndGetResults(fixturePath);

  expect(entries.esm).toContain(
    'import * as __WEBPACK_EXTERNAL_MODULE_react__ from "react"',
  );

  expect(entries.cjs).toContain(
    'var external_react_namespaceObject = require("react");',
  );
});

test('auto external false should works', async () => {
  const fixturePath = join(__dirname, 'false');
  const { entries } = await buildAndGetResults(fixturePath);

  expect(entries.esm).not.toContain(
    'import * as __WEBPACK_EXTERNAL_MODULE_react__ from "react"',
  );

  expect(entries.cjs).not.toContain(
    'var external_react_namespaceObject = require("react");',
  );
});

test('externals should overrides auto external', async () => {
  const fixturePath = join(__dirname, 'with-externals');
  const { entries } = await buildAndGetResults(fixturePath);

  expect(entries.esm).toContain(
    'import * as __WEBPACK_EXTERNAL_MODULE_react1__ from "react1"',
  );

  expect(entries.cjs).toContain(
    'var external_react1_namespaceObject = require("react1");',
  );
});
