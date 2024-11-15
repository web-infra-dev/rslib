import { join } from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { expect, test } from 'vitest';

test('should downgrade class private method by default', async () => {
  const fixturePath = join(__dirname, 'default');
  const { entries } = await buildAndGetResults({ fixturePath });

  expect(entries.esm).toMatchSnapshot();
  expect(entries.esm).toContain('#bar');

  expect(entries.cjs).toContain('#bar');
});

test('should downgrade class private method with output.syntax config', async () => {
  const fixturePath = join(__dirname, 'config');
  const { entries } = await buildAndGetResults({ fixturePath });

  expect(entries.esm0).toMatchSnapshot();
  expect(entries.esm0).not.toContain('#bar');

  expect(entries.esm1).toMatchSnapshot();
  expect(entries.esm1).toContain('#bar');

  expect(entries.cjs0).toContain('#bar');
  expect(entries.cjs1).not.toContain('#bar');
});
