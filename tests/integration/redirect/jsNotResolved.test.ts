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
    "import default_0 from "lodash";
    import default_1 from "prettier";
    import default_2 from "./bar.js";
    import default_3 from "./foo.js";
    const src = default_0.toUpper(default_3 + default_2 + typeof default_1.version);
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
    "import default_0 from "lodash";
    import default_1 from "prettier";
    import default_2 from "./bar.js";
    import default_3 from "./foo.js";
    const src = default_0.toUpper(default_3 + default_2 + typeof default_1.version);
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
    "import default_0 from "lodash";
    import default_1 from "prettier";
    import default_2 from "./bar.js";
    import default_3 from "./foo";
    const src = default_0.toUpper(default_3 + default_2 + typeof default_1.version);
    export { src as default };
    "
  `);
});
