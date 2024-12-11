import { buildAndGetResults, queryContent } from 'test-helper';
import { beforeAll, expect, test } from 'vitest';

let contents: Awaited<ReturnType<typeof buildAndGetResults>>['contents'];

beforeAll(async () => {
  const fixturePath = __dirname;
  contents = (await buildAndGetResults({ fixturePath })).contents;
});

test('redirect.js default', async () => {
  const { content: indexContent, path: indexPath } = queryContent(
    contents.esm0!,
    /esm\/index\.js/,
  );
  expect(indexContent).toMatchInlineSnapshot(`
    "import * as __WEBPACK_EXTERNAL_MODULE_lodash__ from "lodash";
    import * as __WEBPACK_EXTERNAL_MODULE__bar_index_js__ from "./bar/index.js";
    import * as __WEBPACK_EXTERNAL_MODULE__foo_js__ from "./foo.js";
    /* ESM default export */ const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE_lodash__["default"].toUpper(__WEBPACK_EXTERNAL_MODULE__foo_js__.foo + __WEBPACK_EXTERNAL_MODULE__bar_index_js__.bar + __WEBPACK_EXTERNAL_MODULE__foo_js__.foo + __WEBPACK_EXTERNAL_MODULE__bar_index_js__.bar);
    export { src_rslib_entry_ as default };
    "
  `);

  expect((await import(indexPath)).default).toMatchInlineSnapshot(
    `"FOOBAR1FOOBAR1"`,
  );
});

test('redirect.js.path false', async () => {
  const { content: indexContent } = queryContent(
    contents.esm1!,
    /esm\/index\.js/,
  );
  expect(indexContent).toMatchInlineSnapshot(`
    "import * as __WEBPACK_EXTERNAL_MODULE_lodash__ from "lodash";
    import * as __WEBPACK_EXTERNAL_MODULE__bar_js__ from "@/bar.js";
    import * as __WEBPACK_EXTERNAL_MODULE__foo_js__ from "@/foo.js";
    import * as __WEBPACK_EXTERNAL_MODULE__bar_js__ from "./bar.js";
    import * as __WEBPACK_EXTERNAL_MODULE__foo_js__ from "./foo.js";
    /* ESM default export */ const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE_lodash__["default"].toUpper(__WEBPACK_EXTERNAL_MODULE__foo_js__.foo + __WEBPACK_EXTERNAL_MODULE__bar_js__.bar + __WEBPACK_EXTERNAL_MODULE__foo_js__.foo + __WEBPACK_EXTERNAL_MODULE__bar_js__.bar);
    export { src_rslib_entry_ as default };
    "
  `);
});

test('redirect.js.path with user override externals', async () => {
  const { content: indexContent, path: indexPath } = queryContent(
    contents.esm2!,
    /esm\/index\.js/,
  );
  expect(indexContent).toMatchInlineSnapshot(`
    "import * as __WEBPACK_EXTERNAL_MODULE_lodash__ from "lodash";
    import * as __WEBPACK_EXTERNAL_MODULE__others_bar_index_js__ from "./others/bar/index.js";
    import * as __WEBPACK_EXTERNAL_MODULE__others_foo_js__ from "./others/foo.js";
    import * as __WEBPACK_EXTERNAL_MODULE__bar_index_js__ from "./bar/index.js";
    import * as __WEBPACK_EXTERNAL_MODULE__foo_js__ from "./foo.js";
    /* ESM default export */ const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE_lodash__["default"].toUpper(__WEBPACK_EXTERNAL_MODULE__foo_js__.foo + __WEBPACK_EXTERNAL_MODULE__bar_index_js__.bar + __WEBPACK_EXTERNAL_MODULE__others_foo_js__.foo + __WEBPACK_EXTERNAL_MODULE__others_bar_index_js__.bar);
    export { src_rslib_entry_ as default };
    "
  `);

  expect((await import(indexPath)).default).toMatchInlineSnapshot(
    `"FOOBAR1OTHERFOOOTHERBAR2"`, // cspell:disable-line
  );
});

test('redirect.js.extension: false', async () => {
  const { content: indexContent } = queryContent(
    contents.esm3!,
    /esm\/index\.js/,
  );
  expect(indexContent).toMatchInlineSnapshot(`
    "import * as __WEBPACK_EXTERNAL_MODULE_lodash__ from "lodash";
    import * as __WEBPACK_EXTERNAL_MODULE__bar_index_ts__ from "./bar/index.ts";
    import * as __WEBPACK_EXTERNAL_MODULE__foo_ts__ from "./foo.ts";
    /* ESM default export */ const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE_lodash__["default"].toUpper(__WEBPACK_EXTERNAL_MODULE__foo_ts__.foo + __WEBPACK_EXTERNAL_MODULE__bar_index_ts__.bar + __WEBPACK_EXTERNAL_MODULE__foo_ts__.foo + __WEBPACK_EXTERNAL_MODULE__bar_index_ts__.bar);
    export { src_rslib_entry_ as default };
    "
  `);
});
