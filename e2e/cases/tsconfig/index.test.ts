import { buildAndGetResults } from '@e2e/helper';
import { expect, test } from 'vitest';

test('tsconfig path', async () => {
  const fixturePath = __dirname;
  const { isSuccess, entries } = await buildAndGetResults(fixturePath);

  expect(isSuccess).toBe(true);
  expect(entries.esm).toContain(`const foo = 'foo'`);
  expect(entries.cjs).toContain(`const foo = 'foo'`);
});
