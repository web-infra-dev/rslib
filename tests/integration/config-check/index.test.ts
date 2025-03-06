import { join } from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { expect, test } from 'vitest';

test('should throw error when lib array not exists or empty', async () => {
  const fixturePath = join(__dirname, 'lib-array');
  try {
    await buildAndGetResults({ fixturePath });
  } catch (error) {
    expect((error as Error).message).toMatchInlineSnapshot(
      `"Expect "lib" field to be a non-empty array, but got: []."`,
    );
  }
});
