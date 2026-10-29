import { expect, test } from '@rstest/core';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { buildAndGetResults, queryContent } from 'test-helper';

const require = createRequire(import.meta.url);

test('should extract css successfully in bundle', async () => {
  const fixturePath = join(__dirname, 'bundle');
  const { contents, files } = await buildAndGetResults({
    fixturePath,
    type: 'css',
  });

  expect(files.esm).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/css/bundle/dist/esm/index.css",
    ]
  `);

  expect(contents.esm).toMatchInlineSnapshot(`
    {
      "<ROOT>/tests/integration/style/css/bundle/dist/esm/index.css": "@import url(https://cdnjs.cloudflare.com/ajax/libs/modern-normalize/1.1.0/modern-normalize.css);
    @import url(https://cdnjs.cloudflare.com/ajax/libs/modern-normalize/1.0.0/modern-normalize.css);
    .lib1 {
      color: red;
    }

    .lib2 {
      color: green;
    }

    .import {
      background-image: url("https://cdnjs.cloudflare.com/ajax/libs/modern-normalize/1.1.0/modern-normalize.css");
    }

    ",
    }
  `);

  expect(files.cjs).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/css/bundle/dist/cjs/index.css",
    ]
  `);

  expect(contents.cjs).toMatchInlineSnapshot(`
    {
      "<ROOT>/tests/integration/style/css/bundle/dist/cjs/index.css": "@import url(https://cdnjs.cloudflare.com/ajax/libs/modern-normalize/1.1.0/modern-normalize.css);
    @import url(https://cdnjs.cloudflare.com/ajax/libs/modern-normalize/1.0.0/modern-normalize.css);
    .lib1 {
      color: red;
    }

    .lib2 {
      color: green;
    }

    .import {
      background-image: url("https://cdnjs.cloudflare.com/ajax/libs/modern-normalize/1.1.0/modern-normalize.css");
    }

    ",
    }
  `);
});

test('should extract css successfully in bundle-false', async () => {
  const fixturePath = join(__dirname, 'bundle-false');
  const { contents, files } = await buildAndGetResults({
    fixturePath,
    type: 'css',
  });

  expect(files.esm).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/css/bundle-false/dist/esm/import.css",
      "<ROOT>/tests/integration/style/css/bundle-false/dist/esm/lib1.css",
      "<ROOT>/tests/integration/style/css/bundle-false/dist/esm/lib2.css",
    ]
  `);
  expect(contents.esm).toMatchInlineSnapshot(`
    {
      "<ROOT>/tests/integration/style/css/bundle-false/dist/esm/import.css": "@import "https://cdnjs.cloudflare.com/ajax/libs/modern-normalize/1.1.0/modern-normalize.css";
    @import "https://cdnjs.cloudflare.com/ajax/libs/modern-normalize/1.0.0/modern-normalize.css";
    @import "lib1.css";
    @import "lib2.css";

    .import {
      background-image: url("https://cdnjs.cloudflare.com/ajax/libs/modern-normalize/1.1.0/modern-normalize.css");
    }

    ",
      "<ROOT>/tests/integration/style/css/bundle-false/dist/esm/lib1.css": ".lib1 {
      color: red;
    }

    ",
      "<ROOT>/tests/integration/style/css/bundle-false/dist/esm/lib2.css": ".lib2 {
      color: green;
    }

    ",
    }
  `);

  expect(files.cjs).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/css/bundle-false/dist/cjs/import.css",
      "<ROOT>/tests/integration/style/css/bundle-false/dist/cjs/lib1.css",
      "<ROOT>/tests/integration/style/css/bundle-false/dist/cjs/lib2.css",
    ]
  `);
  expect(contents.cjs).toMatchInlineSnapshot(`
    {
      "<ROOT>/tests/integration/style/css/bundle-false/dist/cjs/import.css": "@import "https://cdnjs.cloudflare.com/ajax/libs/modern-normalize/1.1.0/modern-normalize.css";
    @import "https://cdnjs.cloudflare.com/ajax/libs/modern-normalize/1.0.0/modern-normalize.css";
    @import "lib1.css";
    @import "lib2.css";

    .import {
      background-image: url("https://cdnjs.cloudflare.com/ajax/libs/modern-normalize/1.1.0/modern-normalize.css");
    }

    ",
      "<ROOT>/tests/integration/style/css/bundle-false/dist/cjs/lib1.css": ".lib1 {
      color: red;
    }

    ",
      "<ROOT>/tests/integration/style/css/bundle-false/dist/cjs/lib2.css": ".lib2 {
      color: green;
    }

    ",
    }
  `);
});

test('should not emit css and css related js in target: "node"', async () => {
  const fixturePath = join(__dirname, 'node-bundle-false');
  const { js, css, dts } = await buildAndGetResults({
    fixturePath,
    type: 'all',
  });

  expect(js.files).toMatchInlineSnapshot('{}');
  expect(css.files).toMatchInlineSnapshot('{}');
  expect(dts.files).toMatchInlineSnapshot('{}');
});

test('import CSS as text without emitting stylesheets', async () => {
  const fixturePath = join(__dirname, 'text-imports');
  const { js, css } = await buildAndGetResults({
    fixturePath,
    type: 'all',
  });
  const cssText = await readFile(join(fixturePath, 'src/style.css'), 'utf8');

  for (const format of ['esm', 'cjs'] as const) {
    const { path } = queryContent(js.contents[format], /index\.(?:js|cjs)$/);
    const output = format === 'esm' ? await import(path) : require(path);

    expect(output.cssText).toBe(cssText);
    expect(output.rawText).toBe(cssText);
    expect(css.files[format] ?? []).toHaveLength(0);
  }
});
