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
    import * as <WEBPACK_EXTERNAL_MODULE> from "./bar/index.js";
    import * as <WEBPACK_EXTERNAL_MODULE> from "./foo.js";
    import * as <WEBPACK_EXTERNAL_MODULE> from "./baz.js";
    const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE_lodash__["default"].toUpper(<WEBPACK_EXTERNAL_MODULE>.foo + <WEBPACK_EXTERNAL_MODULE>.bar + <WEBPACK_EXTERNAL_MODULE>.foo + <WEBPACK_EXTERNAL_MODULE>.bar + <WEBPACK_EXTERNAL_MODULE>.baz);
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
    import * as <WEBPACK_EXTERNAL_MODULE> from "@/bar.js";
    import * as <WEBPACK_EXTERNAL_MODULE> from "@/foo.js";
    import * as <WEBPACK_EXTERNAL_MODULE> from "~/baz.js";
    import * as <WEBPACK_EXTERNAL_MODULE> from "./bar.js";
    import * as <WEBPACK_EXTERNAL_MODULE> from "./foo.js";
    const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE_lodash__["default"].toUpper(<WEBPACK_EXTERNAL_MODULE>.foo + <WEBPACK_EXTERNAL_MODULE>.bar + <WEBPACK_EXTERNAL_MODULE>.foo + <WEBPACK_EXTERNAL_MODULE>.bar + <WEBPACK_EXTERNAL_MODULE>.baz);
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
    import * as <WEBPACK_EXTERNAL_MODULE> from "./others/bar/index.js";
    import * as <WEBPACK_EXTERNAL_MODULE> from "./others/foo.js";
    import * as <WEBPACK_EXTERNAL_MODULE> from "./baz.js";
    import * as <WEBPACK_EXTERNAL_MODULE> from "./bar/index.js";
    import * as <WEBPACK_EXTERNAL_MODULE> from "./foo.js";
    const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE_lodash__["default"].toUpper(<WEBPACK_EXTERNAL_MODULE>.foo + <WEBPACK_EXTERNAL_MODULE>.bar + <WEBPACK_EXTERNAL_MODULE>.foo + <WEBPACK_EXTERNAL_MODULE>.bar + <WEBPACK_EXTERNAL_MODULE>.baz);
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
    import * as <WEBPACK_EXTERNAL_MODULE> from "./others/bar/index.js";
    import * as <WEBPACK_EXTERNAL_MODULE> from "./others/foo.js";
    import * as <WEBPACK_EXTERNAL_MODULE> from "./baz.js";
    import * as <WEBPACK_EXTERNAL_MODULE> from "./bar/index.js";
    import * as <WEBPACK_EXTERNAL_MODULE> from "./foo.js";
    const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE_lodash__["default"].toUpper(<WEBPACK_EXTERNAL_MODULE>.foo + <WEBPACK_EXTERNAL_MODULE>.bar + <WEBPACK_EXTERNAL_MODULE>.foo + <WEBPACK_EXTERNAL_MODULE>.bar + <WEBPACK_EXTERNAL_MODULE>.baz);
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
    import * as <WEBPACK_EXTERNAL_MODULE> from "./bar/index.ts";
    import * as <WEBPACK_EXTERNAL_MODULE> from "./foo.ts";
    import * as <WEBPACK_EXTERNAL_MODULE> from "./baz.ts";
    const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE_lodash__["default"].toUpper(<WEBPACK_EXTERNAL_MODULE>.foo + <WEBPACK_EXTERNAL_MODULE>.bar + <WEBPACK_EXTERNAL_MODULE>.foo + <WEBPACK_EXTERNAL_MODULE>.bar + <WEBPACK_EXTERNAL_MODULE>.baz);
    export { src_rslib_entry_ as default };
    "
  `);
});
