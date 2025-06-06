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
    "import external_lodash_default from "lodash";
    import external_prettier_default from "prettier";
    import external_bar_js_default from "./bar.js";
    import external_foo_js_default from "./foo.js";
    const src = external_lodash_default.toUpper(external_foo_js_default + external_bar_js_default + typeof external_prettier_default.version);
    export { src as default };
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
    "import external_lodash_default from "lodash";
    import external_prettier_default from "prettier";
    import external_bar_js_default from "./bar.js";
    import external_foo_js_default from "./foo.js";
    const src = external_lodash_default.toUpper(external_foo_js_default + external_bar_js_default + typeof external_prettier_default.version);
    export { src as default };
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
    "import external_lodash_default from "lodash";
    import external_prettier_default from "prettier";
    import external_bar_js_default from "./bar.js";
    import external_foo_default from "./foo";
    const src = external_lodash_default.toUpper(external_foo_default + external_bar_js_default + typeof external_prettier_default.version);
    export { src as default };
    "
  `);
});
