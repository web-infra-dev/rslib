import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';

test('should extract css with pluginSass in bundle', async () => {
  const fixturePath = join(__dirname, 'bundle');
  const { contents } = await buildAndGetResults({ fixturePath, type: 'css' });

  const esmFileNames = Object.keys(contents.esm);
  const esmFileContents = Object.values(contents.esm);
  expect(esmFileNames).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/sass/bundle/dist/esm/index.css",
    ]
  `);

  expect(esmFileContents).toMatchSnapshot();

  const cjsFileNames = Object.keys(contents.cjs);
  const cjsFileContents = Object.values(contents.cjs);
  expect(cjsFileNames).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/sass/bundle/dist/cjs/index.css",
    ]
  `);
  expect(cjsFileContents).toMatchSnapshot();
});

test('should extract css with pluginSass in bundle-false', async () => {
  const fixturePath = join(__dirname, 'bundle-false');
  const { contents } = await buildAndGetResults({ fixturePath, type: 'css' });

  const esmFileNames = Object.keys(contents.esm);
  const esmFileContents = Object.values(contents.esm);
  expect(esmFileNames).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/sass/bundle-false/dist/esm/foundation/_code.css",
      "<ROOT>/tests/integration/style/sass/bundle-false/dist/esm/foundation/_lists.css",
      "<ROOT>/tests/integration/style/sass/bundle-false/dist/esm/foundation/index.css",
      "<ROOT>/tests/integration/style/sass/bundle-false/dist/esm/index.css",
    ]
  `);
  expect(esmFileContents).toMatchSnapshot();

  const cjsFileNames = Object.keys(contents.cjs);
  const cjsFileContents = Object.values(contents.cjs);
  expect(cjsFileNames).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/sass/bundle-false/dist/cjs/foundation/_code.css",
      "<ROOT>/tests/integration/style/sass/bundle-false/dist/cjs/foundation/_lists.css",
      "<ROOT>/tests/integration/style/sass/bundle-false/dist/cjs/foundation/index.css",
      "<ROOT>/tests/integration/style/sass/bundle-false/dist/cjs/index.css",
    ]
  `);
  expect(cjsFileContents).toMatchSnapshot();
});
