import path from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { expect, test } from 'vitest';

test('import.meta.url should be preserved', async () => {
  const fixturePath = path.resolve(__dirname, 'import-meta-url');
  const { files, entries, entryFiles } = await buildAndGetResults({
    fixturePath,
  });
  expect(files).toMatchInlineSnapshot(`
    {
      "esm": [
        "<ROOT>/tests/integration/format/import-meta-url/dist/esm/index.js",
      ],
    }
  `);
  expect(entries.esm).toMatchInlineSnapshot(`
    "import default_0 from "node:url";
    const packageDirectory = default_0.fileURLToPath(new URL('.', import.meta.url));
    const foo = 'foo';
    export { foo, packageDirectory };
    "
  `);

  const result = await import(entryFiles.esm);
  expect(result).toMatchInlineSnapshot(`
    {
      "foo": "foo",
      "packageDirectory": "<ROOT>/tests/integration/format/import-meta-url/dist/esm/",
    }
  `);
});

test('CJS exports should be statically analyzable (cjs-module-lexer for Node.js)', async () => {
  const fixturePath = path.resolve(__dirname, 'cjs-static-export');
  const { entryFiles } = await buildAndGetResults({
    fixturePath,
  });

  const { bar, foo } = await import(entryFiles.cjs);
  expect(bar).toBe('bar');
  expect(foo).toBe('foo');

  const cjs = await import(entryFiles.cjs);
  expect(cjs).toMatchInlineSnapshot(`
    {
      "bar": "bar",
      "default": {
        "bar": "bar",
        "foo": "foo",
      },
      "foo": "foo",
    }
  `);
});
