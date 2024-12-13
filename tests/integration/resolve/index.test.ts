import { join } from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { expect, test } from 'vitest';

test('resolve data url', async () => {
  const fixturePath = join(__dirname, 'data-url');
  const { entries, isSuccess } = await buildAndGetResults({ fixturePath });

  expect(isSuccess).toBeTruthy();
  expect(entries.esm).toMatchInlineSnapshot(`
    "const javascript_export_default_42 = 42;
    console.log('x:', javascript_export_default_42);
    "
  `);
});

// TODO: false module path is different from linux and windows
// EXTERNAL MODULE: <ROOT>/rslib/e2e/cases/resolve/false/./browser-false/util (ignored)
test.todo('resolve false', async () => {
  const fixturePath = join(__dirname, 'false');
  const { entries, isSuccess } = await buildAndGetResults({ fixturePath });

  expect(isSuccess).toBeTruthy();
  expect(entries.esm).toMatchSnapshot();
});

test('resolve node protocol', async () => {
  const fixturePath = join(__dirname, 'node-protocol');
  const { entries, isSuccess } = await buildAndGetResults({ fixturePath });

  expect(isSuccess).toBeTruthy();
  expect(entries.esm).toMatchInlineSnapshot(`
    "import * as __WEBPACK_EXTERNAL_MODULE_node_path__ from "node:path";
    const { join } = __WEBPACK_EXTERNAL_MODULE_node_path__["default"];
    export { join };
    "
  `);
});

test('resolve with condition exports', async () => {
  const fixturePath = join(__dirname, 'with-condition-exports');
  const { contents, isSuccess } = await buildAndGetResults({ fixturePath });

  const nodeResults = Object.values(contents.esm0!);
  const browserResults = Object.values(contents.esm1!);

  expect(isSuccess).toBeTruthy();

  expect(nodeResults[0]).toContain('lib1 mjs');
  expect(nodeResults[1]).toContain('lib2 module');
  expect(nodeResults[2]).toContain('node');
  expect(nodeResults[3]).toContain('lib1 cjs');

  expect(browserResults[0]).toContain('lib1 mjs');
  expect(browserResults[1]).toContain('lib2 module');
  expect(browserResults[2]).toContain('browser');
  expect(browserResults[3]).toContain('lib1 cjs');
});

test('resolve with js extensions', async () => {
  const fixturePath = join(__dirname, 'with-js-extensions');
  const { entries, isSuccess } = await buildAndGetResults({ fixturePath });

  expect(isSuccess).toBeTruthy();
  expect(entries.esm).toMatchInlineSnapshot(`
    "const value = 1;
    console.log(value);
    "
  `);
});

test('resolve with main fields', async () => {
  const fixturePath = join(__dirname, 'with-main-fields');
  const { contents, isSuccess } = await buildAndGetResults({ fixturePath });
  const results = Object.values(contents);

  expect(isSuccess).toBeTruthy();
  expect(Object.values(results[0]!)[0]).toMatchInlineSnapshot(`
    "const value = 1;
    console.log(value);
    "
  `);
  expect(Object.values(results[1]!)[0]).toContain('main');
  expect(Object.values(results[2]!)[0]).toContain('browser');
});
