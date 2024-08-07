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

    expect(files.esm?.length).toBe(4);
    expect(files.esm?.[0]!.endsWith('.d.ts')).toEqual(true);
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
    expect(files.esm?.length).toBe(4);
    expect(files.esm?.[0]!.startsWith('./dist/custom')).toEqual(true);
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
});

describe('dts when bundle: true', () => {
  test('basic', async () => {
    const fixturePath = join(__dirname, 'bundle');
    const { entryFiles, entries } = await buildAndGetResults(
      fixturePath,
      'rslib.config.ts',
      'dts',
    );

    expect(entryFiles.esm!.endsWith('index.d.ts')).toEqual(true);
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

    expect(entryFiles.esm!.startsWith('./dist/custom')).toEqual(true);
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
});
