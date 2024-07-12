import { expect, test } from 'vitest';
import { buildAndGetEntryJsResults } from '#shared';

test('should downgrade class private method by default', async () => {
  const fixturePath = __dirname;
  const { contents } = await buildAndGetEntryJsResults(fixturePath);

  expect(contents.esm).toMatchSnapshot();
  expect(contents.esm).not.toContain('#bar');

  expect(contents.cjs).toContain('#bar');
});
