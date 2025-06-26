import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import stripAnsi from 'strip-ansi';
import { buildAndGetResults } from 'test-helper';

test('should throw error when lib array not exists or empty', async () => {
  const fixturePath = join(__dirname, 'lib-array');
  try {
    await buildAndGetResults({ fixturePath });
  } catch (error) {
    expect(stripAnsi((error as Error).message)).toMatchInlineSnapshot(
      `"Expect "lib" field to be a non-empty array, but got: []."`,
    );
  }
});
