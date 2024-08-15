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
      "<ROOT>/e2e/cases/bundle-false/basic/dist/cjs/index.js",
      "<ROOT>/e2e/cases/bundle-false/basic/dist/cjs/sum.js",
      "<ROOT>/e2e/cases/bundle-false/basic/dist/cjs/utils/numbers.js",
      "<ROOT>/e2e/cases/bundle-false/basic/dist/cjs/utils/strings.js",
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
      "<ROOT>/e2e/cases/bundle-false/single-file/dist/cjs/index.js",
    ]
  `);
});

test('auto add extension for relative import', async () => {
  const fixturePath = join(__dirname, 'relative-import');
  const { contents } = await buildAndGetResults(fixturePath);

  expect(Object.values(contents.esm)[1]).toContain(
    'import * as __WEBPACK_EXTERNAL_MODULE__bar_js__ from "./bar.js";',
  );
  expect(Object.values(contents.cjs)[1]).toContain(
    'var external_bar_cjs_namespaceObject = require("./bar.cjs");',
  );
});
