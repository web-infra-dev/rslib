import fs from 'node:fs';
import { buildAndGetResults } from 'test-helper';
import { expect, test } from 'vitest';
import { distIndex } from './rslib.config';

test('should run shared plugins only once', async () => {
  const fixturePath = __dirname;
  await buildAndGetResults({ fixturePath });

  const content = fs.readFileSync(distIndex, 'utf-8');
  expect(content).toEqual('count: 1');
});
