import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';
import { expectFileContainContent } from 'test-helper/rstest';

test('should extract css with lightningcss-loader successfully in bundle', async () => {
  const fixturePath = join(__dirname, 'bundle');
  const { contents } = await buildAndGetResults({ fixturePath, type: 'css' });
  const esmFiles = Object.keys(contents.esm);
  expect(esmFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/lightningcss/bundle/dist/esm/index.css",
    ]
  `);
  expectFileContainContent(
    contents.esm,
    'index.css',
    '-webkit-user-select: none;',
  );

  const cjsFiles = Object.keys(contents.cjs);
  expect(cjsFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/lightningcss/bundle/dist/cjs/index.css",
    ]
  `);
  expectFileContainContent(
    contents.cjs,
    'index.css',
    '-webkit-user-select: none;',
  );
});

test('should extract css with lightningcss-loader successfully in bundle-false', async () => {
  const fixturePath = join(__dirname, 'bundle-false');
  const { contents } = await buildAndGetResults({ fixturePath, type: 'css' });
  const esmFiles = Object.keys(contents.esm);
  expect(esmFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/lightningcss/bundle-false/dist/esm/index.css",
      "<ROOT>/tests/integration/style/lightningcss/bundle-false/dist/esm/prefix.css",
    ]
  `);
  expectFileContainContent(
    contents.esm,
    'prefix.css',
    '-webkit-user-select: none;',
  );

  const cjsFiles = Object.keys(contents.cjs);
  expect(cjsFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/lightningcss/bundle-false/dist/cjs/index.css",
      "<ROOT>/tests/integration/style/lightningcss/bundle-false/dist/cjs/prefix.css",
    ]
  `);
  expectFileContainContent(
    contents.cjs,
    'prefix.css',
    '-webkit-user-select: none;',
  );
});
