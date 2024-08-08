import { buildAndGetResults } from '@e2e/helper';
import { expect, test } from 'vitest';

test('auto external false should works', async () => {
  const fixturePath = __dirname;
  const { entries } = await buildAndGetResults(fixturePath);

  expect(entries.esm).toContain(
    'import * as __WEBPACK_EXTERNAL_MODULE_react1__ from "react1"',
  );

  expect(entries.cjs).toContain(
    'var external_react1_namespaceObject = require("react1");',
  );
});
