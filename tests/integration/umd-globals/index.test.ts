import { expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';

test('correct read globals from CommonJS', async () => {
  const fixturePath = __dirname;
  const { entryFiles } = await buildAndGetResults({
    fixturePath,
  });

  const { fn } = require(entryFiles.umd);
  expect(await fn('ok')).toBe('DEBUG:18.3.1/ok');
});
