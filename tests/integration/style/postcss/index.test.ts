import { join } from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { expectFileContainContent } from 'test-helper/vitest';
import { expect, test } from 'vitest';

test('should extract css with postcss-loader successfully in bundle', async () => {
  const fixturePath = join(__dirname, 'bundle');
  const { contents } = await buildAndGetResults(fixturePath, 'css');

  const esmFiles = Object.keys(contents.esm);
  expect(esmFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/postcss/bundle/dist/esm/static/css/index.css",
    ]
  `);
  expectFileContainContent(contents.esm, 'index.css', 'font-size: 16px;');

  const cjsFiles = Object.keys(contents.cjs);
  expect(cjsFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/postcss/bundle/dist/cjs/static/css/index.css",
    ]
  `);
  expectFileContainContent(contents.cjs, 'index.css', 'font-size: 16px;');
});

test('should extract css with postcss-loader successfully in bundle-false', async () => {
  const fixturePath = join(__dirname, 'bundle-false');
  const { contents } = await buildAndGetResults(fixturePath, 'css');

  const esmFiles = Object.keys(contents.esm);
  expect(esmFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/postcss/bundle-false/dist/esm/alias.css",
      "<ROOT>/tests/integration/style/postcss/bundle-false/dist/esm/index.css",
    ]
  `);
  expectFileContainContent(contents.esm, 'alias.css', 'font-size: 16px;');

  const cjsFiles = Object.keys(contents.cjs);
  expect(cjsFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/postcss/bundle-false/dist/cjs/alias.css",
      "<ROOT>/tests/integration/style/postcss/bundle-false/dist/cjs/index.css",
    ]
  `);
  expectFileContainContent(contents.cjs, 'alias.css', 'font-size: 16px;');
});
