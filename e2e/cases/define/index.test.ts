import { buildAndGetResults } from '@e2e/helper';
import { expect, test } from 'vitest';

test('source.define', async () => {
  const fixturePath = __dirname;
  const { entries } = await buildAndGetResults(fixturePath);

  expect(entries.esm0).not.toContain('console.info(VERSION)');
  expect(entries.esm0).toContain('console.info("1.0.0")');
  expect(entries.esm0).toContain('console.info(process.env.NODE_ENV)');

  expect(entries.esm1).not.toContain('console.info(VERSION)');
  expect(entries.esm1).toContain('console.info("1.0.0")');
  expect(entries.esm1).toContain('console.info(process.ENV.MY_CUSTOM_ENV)');

  expect(entries.cjs).not.toContain('console.info(VERSION)');
  expect(entries.cjs).toContain('console.info("1.0.0")');
  expect(entries.cjs).toContain('console.info(process.env.NODE_ENV)');
});
