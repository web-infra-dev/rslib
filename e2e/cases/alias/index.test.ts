import { join } from 'node:path';
import { build } from '@rslib/core';
import { expect, test } from 'vitest';
import { getEntryJsResults } from '#shared';
import { loadConfig } from '../../../packages/core/src/config';

test('alias in js', async () => {
  delete process.env.NODE_ENV;

  const fixturePath = join(__dirname, 'js');
  const rslibConfig = await loadConfig(join(fixturePath, 'rslib.config.ts'));
  await build(rslibConfig);
  const results = await getEntryJsResults(rslibConfig);

  expect(results.esm).toContain('hello world');
  expect(results.cjs).toContain('hello world');
});

test('alias in ts', async () => {
  delete process.env.NODE_ENV;

  const fixturePath = join(__dirname, 'ts');
  const rslibConfig = await loadConfig(join(fixturePath, 'rslib.config.ts'));
  await build(rslibConfig);
  const results = await getEntryJsResults(rslibConfig);

  expect(results.esm).toContain('hello world');
  expect(results.cjs).toContain('hello world');

  // simple artifacts check
  expect(results.esm).toMatchSnapshot();
  expect(results.cjs).toMatchSnapshot();
});
