import { extname, join } from 'node:path';
import { expect, test } from 'vitest';
import { buildAndGetResults } from '#shared';

test('autoExtension generate .mjs in build artifacts with esm format when type is commonjs', async () => {
  const fixturePath = join(__dirname, 'type-commonjs');
  const { entryFiles } = await buildAndGetResults(fixturePath);
  expect(extname(entryFiles.esm!)).toEqual('.mjs');
  expect(extname(entryFiles.cjs!)).toEqual('.js');
});

test('autoExtension generate .cjs in build artifacts with cjs format when type is module', async () => {
  const fixturePath = join(__dirname, 'type-module');
  const { entryFiles } = await buildAndGetResults(fixturePath);
  expect(extname(entryFiles.esm!)).toEqual('.js');
  expect(extname(entryFiles.cjs!)).toEqual('.cjs');
});
