import { join } from 'node:path';
import { expect, test } from 'vitest';
import { buildAndGetResults } from '#shared';

test('alias in js', async () => {
  delete process.env.NODE_ENV;

  const fixturePath = join(__dirname, 'js');
  const { entries } = await buildAndGetResults(fixturePath);

  expect(entries.esm).toContain('hello world');
  expect(entries.cjs).toContain('hello world');
});

test('alias in ts', async () => {
  delete process.env.NODE_ENV;

  const fixturePath = join(__dirname, 'ts');
  const { entries } = await buildAndGetResults(fixturePath);

  expect(entries.esm).toContain('hello world');
  expect(entries.cjs).toContain('hello world');

  // simple artifacts check
  expect(entries.esm).toMatchSnapshot();
  expect(entries.cjs).toMatchSnapshot();
});
