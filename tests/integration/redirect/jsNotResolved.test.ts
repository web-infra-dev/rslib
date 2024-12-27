import path from 'node:path';
import { buildAndGetResults, queryContent } from 'test-helper';
import { expect, test } from 'vitest';

test('redirect.js default', async () => {
  const fixturePath = path.resolve(__dirname, './js-not-resolve');
  const contents = (await buildAndGetResults({ fixturePath, lib: ['esm0'] }))
    .contents;

  const { content: indexContent } = queryContent(
    contents.esm0!,
    /esm\/index\.js/,
  );

  expect(indexContent).toMatchInlineSnapshot(`
    "import * as __WEBPACK_EXTERNAL_MODULE_lodash__ from "lodash";
    import * as __WEBPACK_EXTERNAL_MODULE_prettier__ from "prettier";
    import * as __WEBPACK_EXTERNAL_MODULE__bar_js__ from "./bar.js";
    import * as __WEBPACK_EXTERNAL_MODULE__foo_js__ from "./foo.js";
    console.log('prettier: ', __WEBPACK_EXTERNAL_MODULE_prettier__["default"]);
    const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE_lodash__["default"].toUpper(__WEBPACK_EXTERNAL_MODULE__foo_js__["default"] + __WEBPACK_EXTERNAL_MODULE__bar_js__["default"]);
    export { src_rslib_entry_ as default };
    "
  `);
});

test('redirect.js.path false', async () => {
  const fixturePath = path.resolve(__dirname, './js-not-resolve');
  const contents = (await buildAndGetResults({ fixturePath, lib: ['esm1'] }))
    .contents;

  const { content: indexContent } = queryContent(
    contents.esm1!,
    /esm\/index\.js/,
  );

  expect(indexContent).toMatchInlineSnapshot(`
    "import * as __WEBPACK_EXTERNAL_MODULE_lodash__ from "lodash";
    import * as __WEBPACK_EXTERNAL_MODULE_prettier__ from "prettier";
    import * as __WEBPACK_EXTERNAL_MODULE__bar_js__ from "./bar.js";
    import * as __WEBPACK_EXTERNAL_MODULE__foo_js__ from "./foo.js";
    console.log('prettier: ', __WEBPACK_EXTERNAL_MODULE_prettier__["default"]);
    const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE_lodash__["default"].toUpper(__WEBPACK_EXTERNAL_MODULE__foo_js__["default"] + __WEBPACK_EXTERNAL_MODULE__bar_js__["default"]);
    export { src_rslib_entry_ as default };
    "
  `);
});

test('redirect.js.extension: false', async () => {
  const fixturePath = path.resolve(__dirname, './js-not-resolve');
  const contents = (await buildAndGetResults({ fixturePath, lib: ['esm2'] }))
    .contents;

  const { content: indexContent } = queryContent(
    contents.esm2!,
    /esm\/index\.js/,
  );

  expect(indexContent).toMatchInlineSnapshot(`
    "import * as __WEBPACK_EXTERNAL_MODULE_lodash__ from "lodash";
    import * as __WEBPACK_EXTERNAL_MODULE_prettier__ from "prettier";
    import * as __WEBPACK_EXTERNAL_MODULE__bar_js__ from "./bar.js";
    import * as __WEBPACK_EXTERNAL_MODULE__foo__ from "./foo";
    console.log('prettier: ', __WEBPACK_EXTERNAL_MODULE_prettier__["default"]);
    const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE_lodash__["default"].toUpper(__WEBPACK_EXTERNAL_MODULE__foo__["default"] + __WEBPACK_EXTERNAL_MODULE__bar_js__["default"]);
    export { src_rslib_entry_ as default };
    "
  `);
});
