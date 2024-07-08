import { extname, join } from 'node:path';
import { expect, test } from 'vitest';
import { buildAndGetJsFiles } from '#shared';

test('autoExtension generate .mjs in build artifacts with esm format when type is commonjs', async () => {
  const fixturePath = join(__dirname, 'type-commonjs');
  const { files } = await buildAndGetJsFiles(fixturePath);
  expect(extname(files.esm!)).toEqual('.mjs');
  expect(extname(files.cjs!)).toEqual('.js');
});

test('autoExtension generate .cjs in build artifacts with cjs format when type is module', async () => {
  const fixturePath = join(__dirname, 'type-module');
  const { files } = await buildAndGetJsFiles(fixturePath);
  expect(extname(files.esm!)).toEqual('.js');
  expect(extname(files.cjs!)).toEqual('.cjs');
});
