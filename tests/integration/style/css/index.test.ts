import { join } from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { expect, test } from 'vitest';

test('should extract css successfully in bundle', async () => {
  const fixturePath = join(__dirname, 'bundle');
  const { contents } = await buildAndGetResults(fixturePath, 'css');
  const esmFiles = Object.keys(contents.esm);
  expect(esmFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/css/bundle/dist/esm/static/css/index.css",
    ]
  `);

  const cjsFiles = Object.keys(contents.cjs);
  expect(cjsFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/css/bundle/dist/cjs/static/css/index.css",
    ]
  `);
});

test('should extract css successfully in bundle-false', async () => {
  const fixturePath = join(__dirname, 'bundle-false');
  const { contents } = await buildAndGetResults(fixturePath, 'css');
  const esmFiles = Object.keys(contents.esm);
  expect(esmFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/css/bundle-false/dist/esm/import.css",
      "<ROOT>/tests/integration/style/css/bundle-false/dist/esm/lib1.css",
      "<ROOT>/tests/integration/style/css/bundle-false/dist/esm/lib2.css",
    ]
  `);

  const cjsFiles = Object.keys(contents.cjs);
  expect(cjsFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/css/bundle-false/dist/cjs/import.css",
      "<ROOT>/tests/integration/style/css/bundle-false/dist/cjs/lib1.css",
      "<ROOT>/tests/integration/style/css/bundle-false/dist/cjs/lib2.css",
    ]
  `);
});
