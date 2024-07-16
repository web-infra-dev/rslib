import { expect, test } from 'vitest';
import { buildAndGetJsResults } from '#shared';

test('source.define', async () => {
  const fixturePath = __dirname;
  const { entries } = await buildAndGetJsResults(fixturePath);

  expect(entries.esm).not.toContain('console.info(VERSION)');
  expect(entries.esm).toContain('1.0.0');

  expect(entries.cjs).not.toContain('console.info(VERSION)');
  expect(entries.cjs).toContain('1.0.0');
});
