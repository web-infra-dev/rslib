import { expect, test } from 'vitest';
import { buildAndGetResults } from '#shared';

test('should downgrade class private method by default', async () => {
  const fixturePath = __dirname;
  const { entries } = await buildAndGetResults(fixturePath);

  expect(entries.esm).toMatchSnapshot();
  expect(entries.esm).not.toContain('#bar');

  expect(entries.cjs).toContain('#bar');
});
