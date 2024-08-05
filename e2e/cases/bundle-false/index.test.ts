import { join } from 'node:path';
import { buildAndGetResults } from '@e2e/helper';
import { expect, test } from 'vitest';

test('bundle: false', async () => {
  const fixturePath = join(__dirname, 'basic');
  const { files } = await buildAndGetResults(fixturePath);

  // TODO: record file paths with inline snapshot
  // need to add path serialization
  expect(files.esm?.length).toBe(4);
  expect(files.cjs?.length).toBe(4);
});
