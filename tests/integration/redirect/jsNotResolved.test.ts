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
    "import lodash from "lodash";
    import prettier from "prettier";
    import bar from "./bar.js";
    import foo from "./foo.js";
    const src = lodash.toUpper(foo + bar + typeof prettier.version);
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
    "import lodash from "lodash";
    import prettier from "prettier";
    import bar from "./bar.js";
    import foo from "./foo.js";
    const src = lodash.toUpper(foo + bar + typeof prettier.version);
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
    "import lodash from "lodash";
    import prettier from "prettier";
    import bar from "./bar.js";
    import foo from "./foo";
    const src = lodash.toUpper(foo + bar + typeof prettier.version);
    export { src as default };
    "
  `);
});
