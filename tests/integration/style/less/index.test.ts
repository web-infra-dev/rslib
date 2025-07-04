import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';
import { expectFileContainContent } from 'test-helper/rstest';

test('should extract with pluginLess successfully in bundle-false', async () => {
  const fixturePath = join(__dirname, 'bundle-false');
  const { contents } = await buildAndGetResults({ fixturePath, type: 'css' });

  const esmFiles = Object.keys(contents.esm);
  expect(esmFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/less/bundle-false/dist/esm/index.css",
      "<ROOT>/tests/integration/style/less/bundle-false/dist/esm/nest/alias.css",
      "<ROOT>/tests/integration/style/less/bundle-false/dist/esm/nest/nest.css",
    ]
  `);

  const cjsFiles = Object.keys(contents.cjs);
  expect(cjsFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/less/bundle-false/dist/cjs/index.css",
      "<ROOT>/tests/integration/style/less/bundle-false/dist/cjs/nest/alias.css",
      "<ROOT>/tests/integration/style/less/bundle-false/dist/cjs/nest/nest.css",
    ]
  `);
});

test('should extract css with pluginLess successfully in bundle', async () => {
  const fixturePath = join(__dirname, 'bundle');
  const { contents } = await buildAndGetResults({ fixturePath, type: 'css' });

  const esmFiles = Object.keys(contents.esm);
  expect(esmFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/less/bundle/dist/esm/index.css",
    ]
  `);

  const cjsFiles = Object.keys(contents.cjs);
  expect(cjsFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/less/bundle/dist/cjs/index.css",
    ]
  `);
});

test('should extract css with pluginLess successfully in import case', async () => {
  const fixturePath = join(__dirname, 'bundle-import');
  const { contents } = await buildAndGetResults({ fixturePath, type: 'css' });

  const esmFiles = Object.keys(contents.esm);
  expect(esmFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/less/bundle-import/dist/esm/index.css",
    ]
  `);
  expectFileContainContent(contents.esm, 'index.css', '.lib1 {');

  const cjsFiles = Object.keys(contents.cjs);
  expect(cjsFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/less/bundle-import/dist/cjs/index.css",
    ]
  `);
  expectFileContainContent(contents.cjs, 'index.css', '.lib1 {');
});
