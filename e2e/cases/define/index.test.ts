import { expect, test } from 'vitest';
import { buildAndGetEntryJsResults } from '#shared';

test('define should work', async () => {
  const fixturePath = __dirname;
  const { contents } = await buildAndGetEntryJsResults(fixturePath);

  expect(contents.esm).not.toContain('console.info(VERSION)');
  expect(contents.esm).toContain('1.0.0');

  expect(contents.cjs).not.toContain('console.info(VERSION)');
  expect(contents.cjs).toContain('1.0.0');
});
