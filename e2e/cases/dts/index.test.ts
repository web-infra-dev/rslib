import { join } from 'node:path';
import { buildAndGetResults } from '@e2e/helper';
import { describe, expect, test } from 'vitest';

describe('dts when bundle: false', () => {
  test('basic - bundleless dts', async () => {
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

  test('dts false - bundleless dts', async () => {
    const fixturePath = join(__dirname, 'bundle-false');
    const { files } = await buildAndGetResults(
      fixturePath,
      'rslib.false.config.ts',
      'dts',
    );

    expect(files.esm).toBe(undefined);
  });

  test('distPath - bundleless dts', async () => {
    const fixturePath = join(__dirname, 'bundle-false');
    const { files } = await buildAndGetResults(
      fixturePath,
      'rslib.distpath.config.ts',
      'dts',
    );
    expect(files.esm?.length).toBe(4);
    expect(files.esm?.[0]!.startsWith('./dist/custom')).toEqual(true);
  });
});

describe('dts when bundle: true', () => {
  test('basic - bundle dts', async () => {
    const fixturePath = join(__dirname, 'bundle');
    const { entryFiles, entries } = await buildAndGetResults(
      fixturePath,
      'rslib.config.ts',
      'dts',
    );

    expect(entryFiles.esm!.endsWith('index.d.ts')).toEqual(true);
    expect(entries).toMatchSnapshot();
  });

  test('dts false - bundle dts', async () => {
    const fixturePath = join(__dirname, 'bundle');
    const { entryFiles } = await buildAndGetResults(
      fixturePath,
      'rslib.false.config.ts',
      'dts',
    );

    expect(entryFiles.esm).toEqual(undefined);
  });

  test('distPath - bundle dts', async () => {
    const fixturePath = join(__dirname, 'bundle');
    const { entryFiles } = await buildAndGetResults(
      fixturePath,
      'rslib.distpath.config.ts',
      'dts',
    );

    expect(entryFiles.esm!.startsWith('./dist/custom')).toEqual(true);
  });
});
