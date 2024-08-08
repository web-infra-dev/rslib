import { buildAndGetResults } from '@e2e/helper';
import { expect, test } from 'vitest';

test('auto external should works', async () => {
  const fixturePath = __dirname;
  const { entries } = await buildAndGetResults(fixturePath);

  expect(entries.esm).toContain(
    'import * as __WEBPACK_EXTERNAL_MODULE_react__ from "react"',
  );

  expect(entries.cjs).toContain(
    'var external_react_namespaceObject = require("react");',
  );
});
