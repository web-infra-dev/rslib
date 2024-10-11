import { join } from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { expect, test } from 'vitest';

test('should extract css with pluginSass in bundle', async () => {
  const fixturePath = join(__dirname, 'bundle');
  const { contents } = await buildAndGetResults(fixturePath, 'css');
  const esmFiles = Object.keys(contents.esm);
  expect(esmFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/sass/bundle/dist/esm/static/css/index.css",
    ]
  `);

  const cjsFiles = Object.keys(contents.cjs);
  expect(cjsFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/sass/bundle/dist/cjs/static/css/index.css",
    ]
  `);
});

test('should extract css with pluginSass in bundle-false', async () => {
  const fixturePath = join(__dirname, 'bundle-false');
  const { contents } = await buildAndGetResults(fixturePath, 'css');
  const esmFiles = Object.keys(contents.esm);

  expect(esmFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/sass/bundle-false/dist/esm/foundation/_code.css",
      "<ROOT>/tests/integration/style/sass/bundle-false/dist/esm/foundation/_lists.css",
      "<ROOT>/tests/integration/style/sass/bundle-false/dist/esm/index.css",
    ]
  `);

  const cjsFiles = Object.keys(contents.cjs);
  expect(cjsFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/sass/bundle-false/dist/cjs/foundation/_code.css",
      "<ROOT>/tests/integration/style/sass/bundle-false/dist/cjs/foundation/_lists.css",
      "<ROOT>/tests/integration/style/sass/bundle-false/dist/cjs/index.css",
    ]
  `);
});
