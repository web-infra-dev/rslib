import { join } from 'node:path';
import { buildAndGetResults } from '@e2e/helper';
import { expect, test } from 'vitest';

test('basic', async () => {
  const fixturePath = join(__dirname, 'basic');
  const { files } = await buildAndGetResults(fixturePath);

  expect(files.esm).toMatchInlineSnapshot(`
    [
      "<ROOT>/e2e/cases/bundle-false/basic/dist/esm/index.js",
      "<ROOT>/e2e/cases/bundle-false/basic/dist/esm/sum.js",
      "<ROOT>/e2e/cases/bundle-false/basic/dist/esm/utils/numbers.js",
      "<ROOT>/e2e/cases/bundle-false/basic/dist/esm/utils/strings.js",
    ]
  `);
  expect(files.cjs).toMatchInlineSnapshot(`
    [
      "<ROOT>/e2e/cases/bundle-false/basic/dist/cjs/index.cjs",
      "<ROOT>/e2e/cases/bundle-false/basic/dist/cjs/sum.cjs",
      "<ROOT>/e2e/cases/bundle-false/basic/dist/cjs/utils/numbers.cjs",
      "<ROOT>/e2e/cases/bundle-false/basic/dist/cjs/utils/strings.cjs",
    ]
  `);
});

test('single file', async () => {
  const fixturePath = join(__dirname, 'single-file');
  const { files } = await buildAndGetResults(fixturePath);

  expect(files.esm).toMatchInlineSnapshot(`
    [
      "<ROOT>/e2e/cases/bundle-false/single-file/dist/esm/index.js",
    ]
  `);
  expect(files.cjs).toMatchInlineSnapshot(`
    [
      "<ROOT>/e2e/cases/bundle-false/single-file/dist/cjs/index.cjs",
    ]
  `);
});

test('auto add extension for relative import', async () => {
  const fixturePath = join(__dirname, 'relative-import');
  const { contents } = await buildAndGetResults(fixturePath);

  for (const importer of [
    'import * as __WEBPACK_EXTERNAL_MODULE__bar_js__ from "./bar.js";',
    'import * as __WEBPACK_EXTERNAL_MODULE__baz_js__ from "./baz.js";',
    'import * as __WEBPACK_EXTERNAL_MODULE__foo_js__ from "./foo.js";',
    'import * as __WEBPACK_EXTERNAL_MODULE__qux_js__ from "./qux.js";',
  ]) {
    expect(Object.values(contents.esm)[3]).toContain(importer);
  }

  for (const requirer of [
    'const external_bar_cjs_namespaceObject = require("./bar.cjs");',
    'const external_baz_cjs_namespaceObject = require("./baz.cjs");',
    'const external_foo_cjs_namespaceObject = require("./foo.cjs");',
    'const external_qux_cjs_namespaceObject = require("./qux.cjs");',
  ]) {
    expect(Object.values(contents.cjs)[3]).toContain(requirer);
  }
});
