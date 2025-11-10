import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';

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

test('resolve false', async () => {
  const fixturePath = join(__dirname, 'false');
  const { entries, isSuccess } = await buildAndGetResults({ fixturePath });

  expect(isSuccess).toBeTruthy();
  if (process.env.ADVANCED_ESM) {
    expect(entries.esm).toMatchInlineSnapshot(`
      "import { __webpack_require__ } from "./rslib-runtime.js";
      __webpack_require__.add({
          "?27ce": function() {}
      });
      const util_ignored_ = __webpack_require__("?27ce");
      var util_ignored__default = /*#__PURE__*/ __webpack_require__.n(util_ignored_);
      console.log('foo:', util_ignored__default());
      console.log('bar: ', "bar");
      "
    `);
  } else {
    expect(
      entries.esm,
    ).toContain(`var util_ignored_ = __webpack_require__("?27ce");
var util_ignored_default = /*#__PURE__*/ __webpack_require__.n(util_ignored_);
console.log('foo:', util_ignored_default());
console.log('bar: ', "bar");`);
  }
});

test('resolve node protocol', async () => {
  const fixturePath = join(__dirname, 'node-protocol');
  const { entries, isSuccess } = await buildAndGetResults({ fixturePath });

  expect(isSuccess).toBeTruthy();
  if (process.env.ADVANCED_ESM) {
    expect(entries.esm).toMatchInlineSnapshot(`
      "import node_path from "node:path";
      const { join: join } = node_path;
      export { join };
      "
    `);
  } else {
    expect(entries.esm).toMatchInlineSnapshot(`
    "import node_path from "node:path";
    const { join } = node_path;
    export { join };
    "
  `);
  }
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
    "console.log(1);
    "
  `);
});

test('resolve with main fields', async () => {
  const fixturePath = join(__dirname, 'with-main-fields');
  const { contents, isSuccess } = await buildAndGetResults({ fixturePath });
  const results = Object.values(contents);

  expect(isSuccess).toBeTruthy();
  if (process.env.ADVANCED_ESM) {
    expect(Object.values(results[0]!)[0]).toMatchInlineSnapshot(`
      "console.log(1);
      "
    `);
  } else {
    expect(Object.values(results[0]!)[0]).toMatchInlineSnapshot(`
      "console.log(1);
      "
    `);
  }
  expect(Object.values(results[1]!)[0]).toContain('main');
  expect(Object.values(results[2]!)[0]).toContain('browser');
});
