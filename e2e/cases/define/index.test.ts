import { expect, test } from 'vitest';
import { buildAndGetJsContents } from '#shared';

test('define should work', async () => {
  const fixturePath = __dirname;
  const { entries } = await buildAndGetJsContents(fixturePath);

  expect(entries.esm).not.toContain('console.info(VERSION)');
  expect(entries.esm).toContain('1.0.0');

  expect(entries.cjs).not.toContain('console.info(VERSION)');
  expect(entries.cjs).toContain('1.0.0');
});
