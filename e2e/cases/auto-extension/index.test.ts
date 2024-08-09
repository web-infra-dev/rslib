import { extname, join } from 'node:path';
import { buildAndGetResults } from '@e2e/helper';
import { describe, expect, test } from 'vitest';

describe('autoExtension: true', () => {
  test('generate .mjs in build artifacts with esm format when type is commonjs', async () => {
    const fixturePath = join(__dirname, 'type-commonjs', 'default');
    const { entryFiles } = await buildAndGetResults(fixturePath);
    expect(extname(entryFiles.esm!)).toEqual('.mjs');
    expect(extname(entryFiles.cjs!)).toEqual('.js');
  });

  test('generate .cjs in build artifacts with cjs format when type is module', async () => {
    const fixturePath = join(__dirname, 'type-module', 'default');
    const { entryFiles } = await buildAndGetResults(fixturePath);
    expect(extname(entryFiles.esm!)).toEqual('.js');
    expect(extname(entryFiles.cjs!)).toEqual('.cjs');
  });
});

describe('autoExtension: false', () => {
  test('generate .js in both cjs and esm build artifacts when type is commonjs', async () => {
    const fixturePath = join(__dirname, 'type-commonjs', 'false');
    const { entryFiles } = await buildAndGetResults(fixturePath);
    expect(extname(entryFiles.esm!)).toEqual('.js');
    expect(extname(entryFiles.cjs!)).toEqual('.js');
  });

  test('generate .js in both cjs and esm build artifacts when type is module', async () => {
    const fixturePath = join(__dirname, 'type-module', 'false');
    const { entryFiles } = await buildAndGetResults(fixturePath);
    expect(extname(entryFiles.esm!)).toEqual('.js');
    expect(extname(entryFiles.cjs!)).toEqual('.js');
  });
});
