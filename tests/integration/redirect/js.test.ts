import path from 'node:path';
import { beforeAll, expect, test } from '@rstest/core';
import { buildAndGetResults, queryContent } from 'test-helper';

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
    "import lodash from "lodash";
    import lodash_merge from "lodash.merge";
    import prettier from "prettier";
    import { bar } from "./bar/index.js";
    import { foo } from "./foo.js";
    import { baz } from "./baz.js";
    export * from "./.hidden.js";
    export * from "./.hidden-folder/index.js";
    export * from "./bar.node.js";
    export * from "./bar.node.js";
    export * from "./bar.node.js";
    export * from "./foo.js";
    export * from "./foo.js";
    const src = lodash.toUpper(lodash_merge(foo) + bar + foo + bar + baz + typeof prettier.version);
    export { src as default };
    "
  `);

  const esmResult = await import(indexEsmPath);
  const cjsResult = await import(indexCjsPath);

  expect(esmResult.default).toEqual(cjsResult.default);
  expect(esmResult.default).toMatchInlineSnapshot(`"FOOBAR1FOOBAR1BAZSTRING"`); // cspell:disable-line
});

test('redirect.js.path false', async () => {
  const { content: indexContent } = queryContent(
    contents.esm1!,
    /esm\/index\.js/,
  );

  expect(indexContent).toMatchInlineSnapshot(`
    "import lodash from "lodash";
    import lodash_merge from "lodash.merge";
    import prettier from "prettier";
    import { bar } from "@/bar";
    import { foo } from "@/foo";
    import { baz } from "~/baz";
    import { bar as index_js_bar } from "./bar/index.js";
    import { foo as external_foo_js_foo } from "./foo.js";
    export * from "./.hidden.js";
    export * from "./.hidden-folder/index.js";
    export * from "./bar.node.js";
    export * from "./bar.node.js";
    export * from "./bar.node.js";
    export * from "./foo.js";
    export * from "./foo.js";
    const src = lodash.toUpper(lodash_merge(external_foo_js_foo) + index_js_bar + foo + bar + baz + typeof prettier.version);
    export { src as default };
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
    "import lodash from "lodash";
    import lodash_merge from "lodash.merge";
    import prettier from "prettier";
    import { bar } from "./others/bar/index.js";
    import { foo } from "./others/foo.js";
    import { baz } from "./baz.js";
    import { bar as index_js_bar } from "./bar/index.js";
    import { foo as external_foo_js_foo } from "./foo.js";
    export * from "./.hidden.js";
    export * from "./.hidden-folder/index.js";
    export * from "./bar.node.js";
    export * from "./bar.node.js";
    export * from "./bar.node.js";
    export * from "./foo.js";
    export * from "./foo.js";
    const src = lodash.toUpper(lodash_merge(external_foo_js_foo) + index_js_bar + foo + bar + baz + typeof prettier.version);
    export { src as default };
    "
  `);

  const esmResult = await import(indexEsmPath);
  const cjsResult = await import(indexCjsPath);

  expect(esmResult.default).toEqual(cjsResult.default);
  expect(esmResult.default).toMatchInlineSnapshot(
    `"FOOBAR1OTHERFOOOTHERBAR2BAZSTRING"`, // cspell:disable-line
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
    "import lodash from "lodash";
    import lodash_merge from "lodash.merge";
    import prettier from "prettier";
    import { bar } from "./others/bar/index.js";
    import { foo } from "./others/foo.js";
    import { baz } from "./baz.js";
    import { bar as index_js_bar } from "./bar/index.js";
    import { foo as external_foo_js_foo } from "./foo.js";
    export * from "./.hidden.js";
    export * from "./.hidden-folder/index.js";
    export * from "./bar.node.js";
    export * from "./bar.node.js";
    export * from "./bar.node.js";
    export * from "./foo.js";
    export * from "./foo.js";
    const src = lodash.toUpper(lodash_merge(external_foo_js_foo) + index_js_bar + foo + bar + baz + typeof prettier.version);
    export { src as default };
    "
  `);

  const esmResult = await import(indexEsmPath);
  const cjsResult = await import(indexCjsPath);

  expect(esmResult.default).toEqual(cjsResult.default);
  expect(esmResult.default).toMatchInlineSnapshot(
    `"FOOBAR1OTHERFOOOTHERBAR2BAZSTRING"`, // cspell:disable-line
  );
});

test('redirect.js.extension: false', async () => {
  const { content: indexContent } = queryContent(
    contents.esm4!,
    /esm\/index\.js/,
  );

  expect(indexContent).toMatchInlineSnapshot(`
    "import lodash from "lodash";
    import lodash_merge from "lodash.merge";
    import prettier from "prettier";
    import { bar } from "./bar/index";
    import { foo } from "./foo";
    import { baz } from "./baz";
    export * from "./.hidden";
    export * from "./.hidden-folder/index";
    export * from "./bar.node";
    export * from "./bar.node.js";
    export * from "./bar.node.ts";
    export * from "./foo.js";
    export * from "./foo.ts";
    const src = lodash.toUpper(lodash_merge(foo) + bar + foo + bar + baz + typeof prettier.version);
    export { src as default };
    "
  `);
});
