import { join } from 'node:path';
import { buildAndGetResults } from '@e2e/helper';
import { expect, test } from 'vitest';

test('dts when bundle: false', async () => {
  const fixturePath = join(__dirname, 'bundle-false');
  const { files, contents } = await buildAndGetResults(fixturePath, 'dts');

  expect(files.esm?.length).toBe(4);
  expect(files.esm?.[0]!.endsWith('.d.ts')).toEqual(true);
  expect(contents.esm).toMatchSnapshot();
});

test('dts when bundle: true', async () => {
  const fixturePath = join(__dirname, 'bundle');
  const { entryFiles, entries } = await buildAndGetResults(fixturePath, 'dts');

  expect(entryFiles.esm!.endsWith('index.d.ts')).toEqual(true);
  expect(entries).toMatchSnapshot();
});
