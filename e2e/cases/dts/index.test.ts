import { join } from 'node:path';
import { buildAndGetResults } from '@e2e/helper';
import { describe, expect, test } from 'vitest';

describe('dts when bundle: false', () => {
  test('basic', async () => {
    const fixturePath = join(__dirname, 'bundle-false');
    const { files, contents } = await buildAndGetResults(
      fixturePath,
      'rslib.config.ts',
      'dts',
    );

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "./dist/esm/index.d.ts",
        "./dist/esm/sum.d.ts",
        "./dist/esm/utils/numbers.d.ts",
        "./dist/esm/utils/strings.d.ts",
      ]
    `);
    expect(contents.esm).toMatchSnapshot();
  });

  test('dts false', async () => {
    const fixturePath = join(__dirname, 'bundle-false');
    const { files } = await buildAndGetResults(
      fixturePath,
      'dtsFalse.config.ts',
      'dts',
    );

    expect(files.esm).toBe(undefined);
  });

  test('distPath', async () => {
    const fixturePath = join(__dirname, 'bundle-false');
    const { files } = await buildAndGetResults(
      fixturePath,
      'distPath.config.ts',
      'dts',
    );

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "./dist/custom/index.d.ts",
        "./dist/custom/sum.d.ts",
        "./dist/custom/utils/numbers.d.ts",
        "./dist/custom/utils/strings.d.ts",
      ]
    `);
  });

  test('abortOnError: false', async () => {
    const fixturePath = join(__dirname, 'bundle-false');
    const { isSuccess } = await buildAndGetResults(
      fixturePath,
      'abortOnError.config.ts',
      'dts',
    );

    expect(isSuccess).toBe(true);
  });

  test('autoExtension: true', async () => {
    const fixturePath = join(__dirname, 'bundle-false');
    const { files } = await buildAndGetResults(
      fixturePath,
      'autoExtension.config.ts',
      'dts',
    );

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "./dist/cjs/index.d.cts",
        "./dist/cjs/sum.d.cts",
        "./dist/cjs/utils/numbers.d.cts",
        "./dist/cjs/utils/strings.d.cts",
      ]
    `);
  });
});

describe('dts when bundle: true', () => {
  test('basic', async () => {
    const fixturePath = join(__dirname, 'bundle');
    const { entryFiles, entries } = await buildAndGetResults(
      fixturePath,
      'rslib.config.ts',
      'dts',
    );

    expect(entryFiles.esm).toEqual('./dist/esm/index.d.ts');
    expect(entries).toMatchSnapshot();
  });

  test('dts false', async () => {
    const fixturePath = join(__dirname, 'bundle');
    const { entryFiles } = await buildAndGetResults(
      fixturePath,
      'dtsFalse.config.ts',
      'dts',
    );

    expect(entryFiles.esm).toEqual(undefined);
  });

  test('distPath', async () => {
    const fixturePath = join(__dirname, 'bundle');
    const { entryFiles } = await buildAndGetResults(
      fixturePath,
      'distPath.config.ts',
      'dts',
    );

    expect(entryFiles.esm).toEqual('./dist/custom/index.d.ts');
  });

  test('abortOnError: false', async () => {
    const fixturePath = join(__dirname, 'bundle');
    const { isSuccess } = await buildAndGetResults(
      fixturePath,
      'abortOnError.config.ts',
      'dts',
    );

    expect(isSuccess).toBe(true);
  });

  test('autoExtension: true', async () => {
    const fixturePath = join(__dirname, 'bundle');
    const { entryFiles } = await buildAndGetResults(
      fixturePath,
      'autoExtension.config.ts',
      'dts',
    );

    expect(entryFiles.cjs).toEqual('./dist/cjs/index.d.cts');
  });
});
