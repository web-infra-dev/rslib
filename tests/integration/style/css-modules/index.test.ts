import { join } from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { expectFileContainContent } from 'test-helper/vitest';
import { expect, test } from 'vitest';

test('should extract css-modules successfully in bundle', async () => {
  const fixturePath = join(__dirname, 'bundle');
  const { contents } = await buildAndGetResults({ fixturePath, type: 'css' });

  const esmFiles = Object.keys(contents.esm);
  expect(esmFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/css-modules/bundle/dist/esm/index.css",
    ]
  `);

  const cjsFiles = Object.keys(contents.cjs);
  expect(cjsFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/css-modules/bundle/dist/cjs/index.css",
    ]
  `);
});

test('should extract css-modules successfully in bundle-false', async () => {
  const fixturePath = join(__dirname, 'bundle-false');
  const result = await buildAndGetResults({ fixturePath, type: 'all' });

  const contents = result.css.contents;
  const jsContents = result.js.contents;

  const esmFiles = Object.keys(contents.esm);
  expect(esmFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/css-modules/bundle-false/dist/esm/button/index_module.css",
      "<ROOT>/tests/integration/style/css-modules/bundle-false/dist/esm/reset.css",
    ]
  `);
  expectFileContainContent(
    jsContents.esm,
    'button/index.module.js',
    'import "./index_module.css"',
  );

  const cjsFiles = Object.keys(contents.cjs);
  expect(cjsFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/css-modules/bundle-false/dist/cjs/button/index_module.css",
      "<ROOT>/tests/integration/style/css-modules/bundle-false/dist/cjs/reset.css",
    ]
  `);
  expectFileContainContent(
    jsContents.cjs,
    'button/index.module.cjs',
    'require("./index_module.css")',
  );
});

test('should extract css-modules successfully in bundle-false with output.cssModules.auto config', async () => {
  const fixturePath = join(__dirname, 'bundle-false-auto');
  const result = await buildAndGetResults({ fixturePath, type: 'all' });

  const contents = result.css.contents;
  const jsContents = result.js.contents;

  const esmFiles = Object.keys(contents.esm);
  expect(esmFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/css-modules/bundle-false-auto/dist/esm/button/index_module.css",
      "<ROOT>/tests/integration/style/css-modules/bundle-false-auto/dist/esm/reset.css",
    ]
  `);
  expectFileContainContent(jsContents.esm, 'reset.js', 'import "./reset.css"');

  const cjsFiles = Object.keys(contents.cjs);
  expect(cjsFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/css-modules/bundle-false-auto/dist/cjs/button/index_module.css",
      "<ROOT>/tests/integration/style/css-modules/bundle-false-auto/dist/cjs/reset.css",
    ]
  `);
  expectFileContainContent(
    jsContents.cjs,
    'reset.cjs',
    'require("./reset.css")',
  );
});

test('should extract css-modules successfully in bundle-false with output.cssModules.auto:false config', async () => {
  const fixturePath = join(__dirname, 'bundle-false-auto-false');
  const result = await buildAndGetResults({ fixturePath, type: 'all' });

  const contents = result.css.contents;
  const jsContents = result.js.contents;

  const esmFiles = Object.keys(contents.esm);
  expect(esmFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/css-modules/bundle-false-auto-false/dist/esm/button/index.module.css",
      "<ROOT>/tests/integration/style/css-modules/bundle-false-auto-false/dist/esm/reset.css",
    ]
  `);
  expectFileContainContent(
    jsContents.esm,
    'button/index.js',
    'from "./index.module.css"',
  );
  expectFileContainContent(
    jsContents.esm,
    'dist/esm/index.js',
    'import "./reset.css"',
  );

  const cjsFiles = Object.keys(contents.cjs);
  expect(cjsFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/css-modules/bundle-false-auto-false/dist/cjs/button/index.module.css",
      "<ROOT>/tests/integration/style/css-modules/bundle-false-auto-false/dist/cjs/reset.css",
    ]
  `);
  expectFileContainContent(
    jsContents.cjs,
    'button/index.cjs',
    'require("./index.module.css")',
  );
  expectFileContainContent(
    jsContents.cjs,
    'dist/cjs/index.cjs',
    'require("./reset.css")',
  );
});
