import { join } from 'node:path';
import { stripVTControlCharacters as stripAnsi } from 'node:util';
import { expect, test } from '@rstest/core';
import { buildAndGetResults, expectBuildToFail } from 'test-helper';

test('should throw error when lib array not exists or empty', async () => {
  const fixturePath = join(__dirname, 'lib-array');
  const error = await expectBuildToFail(buildAndGetResults({ fixturePath }));
  expect(stripAnsi(error.message)).toMatchInlineSnapshot(
    `"Expect "lib" field to be a non-empty array, but got: []."`,
  );
});
