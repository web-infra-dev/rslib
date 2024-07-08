import { expect, test } from 'vitest';
import { buildAndGetJsContents } from '#shared';

test('alias should work', async () => {
  const fixturePath = __dirname;
  const { entries } = await buildAndGetJsContents(fixturePath);

  expect(entries.esm).toContain('hello world');
  expect(entries.cjs).toContain('hello world');

  // simple artifacts check
  expect(entries.esm).toMatchSnapshot();
  expect(entries.cjs).toMatchSnapshot();
});
