import { join } from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { expectFileContainContent } from 'test-helper/vitest';
import { expect, test } from 'vitest';

test('should extract css with pluginStylus in bundle', async () => {
  const fixturePath = join(__dirname, 'bundle');
  const { contents } = await buildAndGetResults({ fixturePath, type: 'css' });

  const esmCssFiles = Object.keys(contents.esm);
  const esmCssContents = Object.values(contents.esm);
  const cjsCssFiles = Object.keys(contents.cjs);
  const cjsCssContents = Object.values(contents.cjs);

  expect(esmCssFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/stylus/bundle/dist/esm/index.css",
    ]
  `);
  expect(esmCssContents).toMatchInlineSnapshot(`
    [
      "body {
      color: red;
      background: url(./static/svg/logo.svg);
      font: 14px Arial, sans-serif;
    }

    .title-class-zHhfRC {
      font-size: 14px;
    }

    ",
    ]
  `);
  expect(cjsCssFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/stylus/bundle/dist/cjs/index.css",
    ]
  `);
  expect(cjsCssContents).toMatchInlineSnapshot(`
    [
      "body {
      color: red;
      background: url(./static/svg/logo.svg);
      font: 14px Arial, sans-serif;
    }

    .title-class-zHhfRC {
      font-size: 14px;
    }

    ",
    ]
  `);
});

test('should extract css with pluginStylus in bundle-false', async () => {
  const fixturePath = join(__dirname, 'bundle-false');
  const result = await buildAndGetResults({ fixturePath, type: 'all' });

  const contents = result.css.contents;
  const jsContents = result.js.contents;

  const esmCssFiles = Object.keys(contents.esm);
  const esmCssContents = Object.values(contents.esm);
  const cjsCssFiles = Object.keys(contents.cjs);
  const cjsCssContents = Object.values(contents.cjs);

  expect(esmCssFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/stylus/bundle-false/dist/esm/a.css",
      "<ROOT>/tests/integration/style/stylus/bundle-false/dist/esm/b_module.css",
    ]
  `);
  expect(esmCssContents).toMatchInlineSnapshot(`
    [
      "body {
      color: red;
      background: url(./static/svg/logo.svg);
      font: 14px Arial, sans-serif;
    }

    ",
      ".title-class-zHhfRC {
      font-size: 14px;
    }

    ",
    ]
  `);

  expectFileContainContent(
    jsContents.esm,
    'assets/logo.js',
    'import logo_namespaceObject from "../static/svg/logo.svg"',
  );
  expectFileContainContent(
    jsContents.esm,
    'b.module.js',
    'import "./b_module.css',
  );
  expectFileContainContent(jsContents.esm, 'index.js', [
    'import "./a.css"',
    'import b_module from "./b.module.js"',
  ]);

  expect(cjsCssFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/stylus/bundle-false/dist/cjs/a.css",
      "<ROOT>/tests/integration/style/stylus/bundle-false/dist/cjs/b_module.css",
    ]
  `);
  expect(cjsCssContents).toMatchInlineSnapshot(`
    [
      "body {
      color: red;
      background: url(./static/svg/logo.svg);
      font: 14px Arial, sans-serif;
    }

    ",
      ".title-class-zHhfRC {
      font-size: 14px;
    }

    ",
    ]
  `);
  expectFileContainContent(
    jsContents.cjs,
    'assets/logo.cjs',
    'require("../static/svg/logo.svg")',
  );
  expectFileContainContent(
    jsContents.cjs,
    'b.module.cjs',
    'require("./b_module.css")',
  );
  expectFileContainContent(jsContents.cjs, 'index.cjs', [
    'require("./a.css")',
    'require("./b.module.cjs")',
  ]);
});
