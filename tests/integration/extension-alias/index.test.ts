import { expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';

test('resolve.extensionAlias should work', async () => {
  const fixturePath = __dirname;
  const { entries } = await buildAndGetResults({ fixturePath });

  expect(entries.cjs).toMatchSnapshot();
  expect(entries.esm).toMatchSnapshot();
});
