import { join } from 'node:path';
import { expect, test } from 'vitest';
import { buildAndGetResults } from '#shared';

test('define in js', async () => {
  const fixturePath = join(__dirname, 'js');
  const { entries } = await buildAndGetResults(fixturePath);

  // TODO: remove js/ts dir in cases `define` and `alias`
  // supersede with a complex js/ts combined case
  expect(entries.esm).not.toContain('console.info(VERSION)');
  expect(entries.esm).toContain('1.0.0');

  expect(entries.cjs).not.toContain('console.info(VERSION)');
  expect(entries.cjs).toContain('1.0.0');
});

test('define in ts', async () => {
  const fixturePath = join(__dirname, 'ts');
  const { entries } = await buildAndGetResults(fixturePath);

  expect(entries.esm).not.toContain('console.info(VERSION)');
  expect(entries.esm).toContain('1.0.0');

  expect(entries.cjs).not.toContain('console.info(VERSION)');
  expect(entries.cjs).toContain('1.0.0');
});
