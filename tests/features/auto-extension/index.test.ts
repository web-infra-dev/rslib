import { extname, join } from 'node:path';
import { buildAndGetResults } from 'test-helper';
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

describe('should respect output.filename.js to override builtin logic', () => {
  test('type is commonjs', async () => {
    const fixturePath = join(__dirname, 'type-commonjs', 'config-override');
    const { entryFiles } = await buildAndGetResults(fixturePath);
    expect(extname(entryFiles.esm!)).toEqual('.mjs');
    expect(entryFiles.cjs).toMatchInlineSnapshot(
      `"<ROOT>/tests/features/auto-extension/type-commonjs/config-override/dist/cjs/index.d08e1bb3.js"`,
    );
  });

  test('type is module', async () => {
    const fixturePath = join(__dirname, 'type-module', 'config-override');
    const { entryFiles } = await buildAndGetResults(fixturePath);
    expect(entryFiles.esm).toMatchInlineSnapshot(
      `"<ROOT>/tests/features/auto-extension/type-module/config-override/dist/esm/index.d2068839.js"`,
    );
    expect(extname(entryFiles.cjs!)).toEqual('.cjs');
  });
});
