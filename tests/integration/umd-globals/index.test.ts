import { expect, test } from '@rstest/core';
import { createRequire } from 'node:module';
import { buildAndGetResults } from 'test-helper';

const require = createRequire(import.meta.url);

test('correct read globals from CommonJS', async () => {
  const fixturePath = __dirname;
  const { entryFiles } = await buildAndGetResults({
    fixturePath,
  });

  const { fn } = require(entryFiles.umd);
  expect(await fn('ok')).toBe('DEBUG:18.3.1/ok');
});
