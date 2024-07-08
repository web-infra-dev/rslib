import { join } from 'node:path';
import { expect, test } from 'vitest';
import { buildAndGetResults } from '#shared';

test('auto externalize Node.js built-in modules when platform is "node"', async () => {
  const fixturePath = join(__dirname);
  const { entries } = await buildAndGetResults(fixturePath);

  for (const external of [
    'import * as __WEBPACK_EXTERNAL_MODULE_fs__ from "fs"',
    'import * as __WEBPACK_EXTERNAL_MODULE_node_assert__ from "node:assert"',
    'import * as __WEBPACK_EXTERNAL_MODULE_react__ from "react"',
  ]) {
    expect(entries.esm).toContain(external);
  }

  for (const external of [
    'var external_fs_namespaceObject = require("fs");',
    'var external_node_assert_namespaceObject = require("node:assert");',
    'var external_react_namespaceObject = require("react");',
  ]) {
    expect(entries.cjs).toContain(external);
  }
});
