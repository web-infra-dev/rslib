import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildAndGetResults, queryContent } from 'test-helper';
import { describe, expect, test } from 'vitest';

describe('JSON', async () => {
  const fixturePath = join(__dirname, '.');
  const { contents, files } = await buildAndGetResults({ fixturePath });

  test('bundle', async () => {
    const { content: bundle } = queryContent(contents.esm0!, /index\.js/);
    expect(bundle).toMatchInlineSnapshot(`
    "var foo_namespaceObject = {
        S: "foo"
    };
    const src = foo_namespaceObject.S + '1';
    export { src as default };
    "
  `);
    const bundleResult = await import(files.esm0![0]!);
    expect(bundleResult.default).toBe('foo1');
  });

  test('bundleless default', async () => {
    const bundlelessFiles = Object.keys(contents.esm1!);
    expect(bundlelessFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/json/dist/bundleless-default/foo.js",
      "<ROOT>/tests/integration/json/dist/bundleless-default/index.js",
    ]
  `);
    const bundlelessResult = await import(
      files.esm1!.find((file) => file.endsWith('index.js'))!
    );
    expect(bundlelessResult.default).toBe('foo1');
  });

  test('bundleless preserve JSON', async () => {
    const { content: bundlelessPreserveJson } = queryContent(
      contents.esm2!,
      /index\.js/,
    );
    expect(bundlelessPreserveJson).toMatchInlineSnapshot(`
      "import { value } from "./foo.json";
      const src = value + '1';
      export { src as default };
      "
    `);

    expect(
      readFileSync(
        join(fixturePath, 'dist/bundleless-preserve-json/foo.json'),
        'utf-8',
      ),
    ).toMatchInlineSnapshot(`
    "{
      "value": "foo",
      "value_unused": "noop"
    }
    "
  `);
  });
});
