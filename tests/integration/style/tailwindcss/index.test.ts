import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';
import { expectFileContainContent } from 'test-helper/rstest';

test('should extract css when using tailwindcss successfully in bundle', async () => {
  const fixturePath = join(__dirname, 'bundle');
  const { contents } = await buildAndGetResults({ fixturePath, type: 'css' });
  const esmFiles = Object.keys(contents.esm);
  expect(esmFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/tailwindcss/bundle/dist/esm/index.css",
    ]
  `);
  expectFileContainContent(contents.esm, 'index.css', [
    '.text-3xl {',
    '.font-bold {',
    '.underline {',
  ]);

  const cjsFiles = Object.keys(contents.cjs);
  expect(cjsFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/tailwindcss/bundle/dist/cjs/index.css",
    ]
  `);
  expectFileContainContent(contents.cjs, 'index.css', [
    '.text-3xl {',
    '.font-bold {',
    '.underline {',
  ]);
});

test('should extract css when using tailwindcss successfully in bundleless', async () => {
  const fixturePath = join(__dirname, 'bundle-false');
  const { contents } = await buildAndGetResults({ fixturePath, type: 'css' });
  const esmFiles = Object.keys(contents.esm);
  expect(esmFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/tailwindcss/bundle-false/dist/esm/index.css",
    ]
  `);
  expectFileContainContent(contents.esm, 'index.css', [
    '.text-3xl {',
    '.font-bold {',
    '.underline {',
  ]);

  const cjsFiles = Object.keys(contents.cjs);
  expect(cjsFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/tailwindcss/bundle-false/dist/cjs/index.css",
    ]
  `);
  expectFileContainContent(contents.cjs, 'index.css', [
    '.text-3xl {',
    '.font-bold {',
    '.underline {',
  ]);
});
