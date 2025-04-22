import path from 'node:path';
import { buildAndGetResults, queryContent } from 'test-helper';
import { beforeAll, expect, test } from 'vitest';

let contents: Awaited<ReturnType<typeof buildAndGetResults>>['contents'];

beforeAll(async () => {
  const fixturePath = path.resolve(__dirname, './asset');
  contents = (await buildAndGetResults({ fixturePath })).contents;
});

test('0. default', async () => {
  const { content: indexJs } = queryContent(contents.esm0!, /index\.js/);
  const { content: indexCjs } = queryContent(contents.cjs0!, /index\.cjs/);
  expect(indexJs).toMatchInlineSnapshot(`
    "import * as __WEBPACK_EXTERNAL_MODULE__assets_logo_js_450929b7__ from "./assets/logo.js";
    __WEBPACK_EXTERNAL_MODULE__assets_logo_js_450929b7__["default"];
    "
  `);
  expect(indexCjs).toContain('require("./assets/logo.cjs")');
});

test('1. redirect.asset = false', async () => {
  const { content: indexJs } = queryContent(contents.esm1!, /index\.js/);
  const { content: indexCjs } = queryContent(contents.cjs1!, /index\.cjs/);
  expect(indexJs).toMatchInlineSnapshot(`
    "import * as __WEBPACK_EXTERNAL_MODULE__assets_logo_svg_cfb3a4d9__ from "./assets/logo.svg";
    __WEBPACK_EXTERNAL_MODULE__assets_logo_svg_cfb3a4d9__["default"];
    "
  `);
  expect(indexCjs).toContain('require("./assets/logo.svg")');
});
