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
    import * as __WEBPACK_EXTERNAL_MODULE__bar_js_69b41beb__ from "./bar.js";
    import * as __WEBPACK_EXTERNAL_MODULE__foo_js_fdf5aa2d__ from "./foo.js";
    const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE_lodash__["default"].toUpper(__WEBPACK_EXTERNAL_MODULE__foo_js_fdf5aa2d__["default"] + __WEBPACK_EXTERNAL_MODULE__bar_js_69b41beb__["default"] + __WEBPACK_EXTERNAL_MODULE_prettier__["default"].version);
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
    import * as __WEBPACK_EXTERNAL_MODULE__bar_js_69b41beb__ from "./bar.js";
    import * as __WEBPACK_EXTERNAL_MODULE__foo_js_fdf5aa2d__ from "./foo.js";
    const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE_lodash__["default"].toUpper(__WEBPACK_EXTERNAL_MODULE__foo_js_fdf5aa2d__["default"] + __WEBPACK_EXTERNAL_MODULE__bar_js_69b41beb__["default"] + __WEBPACK_EXTERNAL_MODULE_prettier__["default"].version);
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
    import * as __WEBPACK_EXTERNAL_MODULE__bar_js_69b41beb__ from "./bar.js";
    import * as __WEBPACK_EXTERNAL_MODULE__foo_23da6eef__ from "./foo";
    const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE_lodash__["default"].toUpper(__WEBPACK_EXTERNAL_MODULE__foo_23da6eef__["default"] + __WEBPACK_EXTERNAL_MODULE__bar_js_69b41beb__["default"] + __WEBPACK_EXTERNAL_MODULE_prettier__["default"].version);
    export { src_rslib_entry_ as default };
    "
  `);
});
