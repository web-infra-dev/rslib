import path from 'node:path';
import { buildAndGetResults, queryContent } from 'test-helper';
import { beforeAll, expect, test } from 'vitest';

let contents: Awaited<ReturnType<typeof buildAndGetResults>>['contents'];

beforeAll(async () => {
  const fixturePath = path.resolve(__dirname, './js');
  contents = (await buildAndGetResults({ fixturePath })).contents;
});

test('redirect.js default', async () => {
  const { content: indexContent, path: indexEsmPath } = queryContent(
    contents.esm0!,
    /esm\/index\.js/,
  );
  const { path: indexCjsPath } = await queryContent(
    contents.cjs0!,
    /cjs\/index\.cjs/,
  );

  expect(indexContent).toMatchInlineSnapshot(`
    "import * as __WEBPACK_EXTERNAL_MODULE_lodash__ from "lodash";
    import * as __WEBPACK_EXTERNAL_MODULE__bar_index_js_89500c0c__ from "./bar/index.js";
    import * as __WEBPACK_EXTERNAL_MODULE__foo_js_fdf5aa2d__ from "./foo.js";
    import * as __WEBPACK_EXTERNAL_MODULE__baz_js_a2c1c788__ from "./baz.js";
    const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE_lodash__["default"].toUpper(__WEBPACK_EXTERNAL_MODULE__foo_js_fdf5aa2d__.foo + __WEBPACK_EXTERNAL_MODULE__bar_index_js_89500c0c__.bar + __WEBPACK_EXTERNAL_MODULE__foo_js_fdf5aa2d__.foo + __WEBPACK_EXTERNAL_MODULE__bar_index_js_89500c0c__.bar + __WEBPACK_EXTERNAL_MODULE__baz_js_a2c1c788__.baz);
    export { src_rslib_entry_ as default };
    "
  `);

  const esmResult = await import(indexEsmPath);
  const cjsResult = await import(indexCjsPath);

  expect(esmResult.default).toEqual(cjsResult.default);
  expect(esmResult.default).toMatchInlineSnapshot(`"FOOBAR1FOOBAR1BAZ"`);
});

test('redirect.js.path false', async () => {
  const { content: indexContent } = queryContent(
    contents.esm1!,
    /esm\/index\.js/,
  );

  expect(indexContent).toMatchInlineSnapshot(`
    "import * as __WEBPACK_EXTERNAL_MODULE_lodash__ from "lodash";
    import * as __WEBPACK_EXTERNAL_MODULE__bar_943a8c75__ from "@/bar";
    import * as __WEBPACK_EXTERNAL_MODULE__foo_a5f33889__ from "@/foo";
    import * as __WEBPACK_EXTERNAL_MODULE__baz_3ce4598c__ from "~/baz";
    import * as __WEBPACK_EXTERNAL_MODULE__bar_js_69b41beb__ from "./bar.js";
    import * as __WEBPACK_EXTERNAL_MODULE__foo_js_fdf5aa2d__ from "./foo.js";
    const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE_lodash__["default"].toUpper(__WEBPACK_EXTERNAL_MODULE__foo_js_fdf5aa2d__.foo + __WEBPACK_EXTERNAL_MODULE__bar_js_69b41beb__.bar + __WEBPACK_EXTERNAL_MODULE__foo_a5f33889__.foo + __WEBPACK_EXTERNAL_MODULE__bar_943a8c75__.bar + __WEBPACK_EXTERNAL_MODULE__baz_3ce4598c__.baz);
    export { src_rslib_entry_ as default };
    "
  `);
});

test('redirect.js.path with user override externals', async () => {
  const { content: indexContent, path: indexEsmPath } = queryContent(
    contents.esm2!,
    /esm\/index\.js/,
  );
  const { path: indexCjsPath } = await queryContent(
    contents.cjs2!,
    /cjs\/index\.cjs/,
  );

  expect(indexContent).toMatchInlineSnapshot(`
    "import * as __WEBPACK_EXTERNAL_MODULE_lodash__ from "lodash";
    import * as __WEBPACK_EXTERNAL_MODULE__others_bar_index_js_6776b573__ from "./others/bar/index.js";
    import * as __WEBPACK_EXTERNAL_MODULE__others_foo_js_920f94ba__ from "./others/foo.js";
    import * as __WEBPACK_EXTERNAL_MODULE__baz_js_a2c1c788__ from "./baz.js";
    import * as __WEBPACK_EXTERNAL_MODULE__bar_index_js_89500c0c__ from "./bar/index.js";
    import * as __WEBPACK_EXTERNAL_MODULE__foo_js_fdf5aa2d__ from "./foo.js";
    const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE_lodash__["default"].toUpper(__WEBPACK_EXTERNAL_MODULE__foo_js_fdf5aa2d__.foo + __WEBPACK_EXTERNAL_MODULE__bar_index_js_89500c0c__.bar + __WEBPACK_EXTERNAL_MODULE__others_foo_js_920f94ba__.foo + __WEBPACK_EXTERNAL_MODULE__others_bar_index_js_6776b573__.bar + __WEBPACK_EXTERNAL_MODULE__baz_js_a2c1c788__.baz);
    export { src_rslib_entry_ as default };
    "
  `);

  const esmResult = await import(indexEsmPath);
  const cjsResult = await import(indexCjsPath);

  expect(esmResult.default).toEqual(cjsResult.default);
  expect(esmResult.default).toMatchInlineSnapshot(
    `"FOOBAR1OTHERFOOOTHERBAR2BAZ"`, // cspell:disable-line
  );
});

test('redirect.js.path with user override alias', async () => {
  const { content: indexContent, path: indexEsmPath } = queryContent(
    contents.esm3!,
    /esm\/index\.js/,
  );
  const { path: indexCjsPath } = await queryContent(
    contents.cjs3!,
    /cjs\/index\.cjs/,
  );

  expect(indexContent).toMatchInlineSnapshot(`
    "import * as __WEBPACK_EXTERNAL_MODULE_lodash__ from "lodash";
    import * as __WEBPACK_EXTERNAL_MODULE__others_bar_index_js_6776b573__ from "./others/bar/index.js";
    import * as __WEBPACK_EXTERNAL_MODULE__others_foo_js_920f94ba__ from "./others/foo.js";
    import * as __WEBPACK_EXTERNAL_MODULE__baz_js_a2c1c788__ from "./baz.js";
    import * as __WEBPACK_EXTERNAL_MODULE__bar_index_js_89500c0c__ from "./bar/index.js";
    import * as __WEBPACK_EXTERNAL_MODULE__foo_js_fdf5aa2d__ from "./foo.js";
    const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE_lodash__["default"].toUpper(__WEBPACK_EXTERNAL_MODULE__foo_js_fdf5aa2d__.foo + __WEBPACK_EXTERNAL_MODULE__bar_index_js_89500c0c__.bar + __WEBPACK_EXTERNAL_MODULE__others_foo_js_920f94ba__.foo + __WEBPACK_EXTERNAL_MODULE__others_bar_index_js_6776b573__.bar + __WEBPACK_EXTERNAL_MODULE__baz_js_a2c1c788__.baz);
    export { src_rslib_entry_ as default };
    "
  `);

  const esmResult = await import(indexEsmPath);
  const cjsResult = await import(indexCjsPath);

  expect(esmResult.default).toEqual(cjsResult.default);
  expect(esmResult.default).toMatchInlineSnapshot(
    `"FOOBAR1OTHERFOOOTHERBAR2BAZ"`, // cspell:disable-line
  );
});

test('redirect.js.extension: false', async () => {
  const { content: indexContent } = queryContent(
    contents.esm4!,
    /esm\/index\.js/,
  );
  expect(indexContent).toMatchInlineSnapshot(`
    "import * as __WEBPACK_EXTERNAL_MODULE_lodash__ from "lodash";
    import * as __WEBPACK_EXTERNAL_MODULE__bar_index_ts_bd8d18e6__ from "./bar/index.ts";
    import * as __WEBPACK_EXTERNAL_MODULE__foo_ts_a526d0a1__ from "./foo.ts";
    import * as __WEBPACK_EXTERNAL_MODULE__baz_ts_10ee073f__ from "./baz.ts";
    const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE_lodash__["default"].toUpper(__WEBPACK_EXTERNAL_MODULE__foo_ts_a526d0a1__.foo + __WEBPACK_EXTERNAL_MODULE__bar_index_ts_bd8d18e6__.bar + __WEBPACK_EXTERNAL_MODULE__foo_ts_a526d0a1__.foo + __WEBPACK_EXTERNAL_MODULE__bar_index_ts_bd8d18e6__.bar + __WEBPACK_EXTERNAL_MODULE__baz_ts_10ee073f__.baz);
    export { src_rslib_entry_ as default };
    "
  `);
});
