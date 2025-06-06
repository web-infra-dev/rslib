import path from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { expect, test } from 'vitest';

test('format default to esm', async () => {
  const fixturePath = path.resolve(__dirname, 'default');
  const { files, contents } = await buildAndGetResults({
    fixturePath,
  });

  expect(files).toMatchInlineSnapshot(`
    {
      "cjs0": [
        "<ROOT>/tests/integration/format/default/dist/bundle-cjs/index.cjs",
      ],
      "cjs1": [
        "<ROOT>/tests/integration/format/default/dist/bundleless-cjs/foo.cjs",
        "<ROOT>/tests/integration/format/default/dist/bundleless-cjs/index.cjs",
      ],
      "esm0": [
        "<ROOT>/tests/integration/format/default/dist/bundle-esm/index.js",
      ],
      "esm1": [
        "<ROOT>/tests/integration/format/default/dist/bundleless-esm/foo.js",
        "<ROOT>/tests/integration/format/default/dist/bundleless-esm/index.js",
      ],
    }
  `);

  expect(contents.esm0).toMatchInlineSnapshot(`
    {
      "<ROOT>/tests/integration/format/default/dist/bundle-esm/index.js": "const foo = 'foo';
    const str = 'hello' + foo + ' world';
    export { str };
    ",
    }
  `);

  expect(contents.esm1).toMatchInlineSnapshot(`
    {
      "<ROOT>/tests/integration/format/default/dist/bundleless-esm/foo.js": "const foo = 'foo';
    export { foo };
    ",
      "<ROOT>/tests/integration/format/default/dist/bundleless-esm/index.js": "import { foo } from "./foo.js";
    const str = 'hello' + foo + ' world';
    export { str };
    ",
    }
  `);
});

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
    "import external_node_url_default from "node:url";
    const packageDirectory = external_node_url_default.fileURLToPath(new URL('.', import.meta.url));
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

test('throw error when using mf with `bundle: false`', async () => {
  const fixturePath = path.resolve(__dirname, 'mf-bundle-false');
  const build = buildAndGetResults({
    fixturePath,
  });

  await expect(build).rejects.toThrowErrorMatchingInlineSnapshot(
    `[Error: When using "mf" format, "bundle" must be set to "true". Since the default value for "bundle" is "true", so you can either explicitly set it to "true" or remove the field entirely.]`,
  );
});
