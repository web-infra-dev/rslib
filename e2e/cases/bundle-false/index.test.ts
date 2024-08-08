import { join } from 'node:path';
import { buildAndGetResults } from '@e2e/helper';
import { expect, test } from 'vitest';

test('basic', async () => {
  const fixturePath = join(__dirname, 'basic');
  const { files } = await buildAndGetResults(fixturePath);

  expect(files.esm).toMatchInlineSnapshot(`
    [
      "./dist/esm/index.js",
      "./dist/esm/sum.js",
      "./dist/esm/utils/numbers.js",
      "./dist/esm/utils/strings.js",
    ]
  `);
  expect(files.cjs).toMatchInlineSnapshot(`
    [
      "./dist/cjs/index.js",
      "./dist/cjs/sum.js",
      "./dist/cjs/utils/numbers.js",
      "./dist/cjs/utils/strings.js",
    ]
  `);
});

test('single file', async () => {
  const fixturePath = join(__dirname, 'single-file');
  const { files } = await buildAndGetResults(fixturePath);

  expect(files.esm?.sort()).toMatchInlineSnapshot(`
    [
      "./dist/esm/index.js",
    ]
  `);
  expect(files.cjs?.sort()).toMatchInlineSnapshot(`
    [
      "./dist/cjs/index.js",
    ]
  `);
});
