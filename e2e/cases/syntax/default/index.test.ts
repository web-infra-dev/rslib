import { buildAndGetResults } from '@e2e/helper';
import { expect, test } from 'vitest';

test('should downgrade class private method by default', async () => {
  const fixturePath = __dirname;
  const { entries } = await buildAndGetResults(fixturePath);

  expect(entries.esm).toMatchSnapshot();
  expect(entries.esm).toContain('#bar');

  expect(entries.cjs).toContain('#bar');
});
