import { expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';

test('tsconfig path', async () => {
  const fixturePath = __dirname;
  const { isSuccess, entries } = await buildAndGetResults({ fixturePath });

  expect(isSuccess).toBe(true);
  expect(entries.esm).toContain(`console.info("foo");
`);
  expect(entries.cjs).toContain(`console.info("foo");
`);
});
