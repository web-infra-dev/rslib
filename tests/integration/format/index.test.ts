import { buildAndGetResults } from 'test-helper';
import { expect, test } from 'vitest';

test('esm', async () => {
  const fixturePath = __dirname;
  const { files, entries, entryFiles } = await buildAndGetResults({
    fixturePath,
  });
  expect(files).toMatchInlineSnapshot(`
    {
      "esm": [
        "<ROOT>/tests/integration/format/dist/esm/index.js",
      ],
    }
  `);
  expect(entries.esm).toMatchInlineSnapshot(`
    "import * as __WEBPACK_EXTERNAL_MODULE_node_url_e96de089__ from "node:url";
    const packageDirectory = __WEBPACK_EXTERNAL_MODULE_node_url_e96de089__["default"].fileURLToPath(new URL('.', import.meta.url));
    const foo = 'foo';
    export { foo, packageDirectory };
    "
  `);

  const result = await import(entryFiles.esm);
  expect(result).toMatchInlineSnapshot(`
    {
      "foo": "foo",
      "packageDirectory": "<ROOT>/tests/integration/format/dist/esm/",
    }
  `);
});
