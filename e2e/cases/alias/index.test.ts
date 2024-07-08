import { expect, test } from 'vitest';
import { buildAndGetEntryJsResults } from '#shared';

test('alias should work', async () => {
  const fixturePath = __dirname;
  const { contents } = await buildAndGetEntryJsResults(fixturePath);

  expect(contents.esm).toContain('hello world');
  expect(contents.cjs).toContain('hello world');

  // simple artifacts check
  expect(contents.esm).toMatchSnapshot();
  expect(contents.cjs).toMatchSnapshot();
});
