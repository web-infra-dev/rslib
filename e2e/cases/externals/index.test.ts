import { join } from 'node:path';
import { build } from '@rslib/core';
import { expect, test } from 'vitest';
import { getEntryJsResults } from '#shared';
import { loadConfig } from '../../../packages/core/src/config';

test('externals', async () => {
  delete process.env.NODE_ENV;

  const fixturePath = join(__dirname, 'js');
  const rslibConfig = await loadConfig(join(fixturePath, 'rslib.config.ts'));
  await build(rslibConfig);
  const results = await getEntryJsResults(rslibConfig);

  // should externalize 'react'

  // should auto externalize 'fs'

  // should auto externalize 'node:assert'

  // expect(results.esm).not.toContain('console.info(VERSION)');
  // expect(results.esm).toContain('1.0.0');
  // expect(results.cjs).not.toContain('console.info(VERSION)');
  // expect(results.cjs).toContain('1.0.0');
});
