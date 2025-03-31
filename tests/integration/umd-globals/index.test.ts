import { buildAndGetResults } from 'test-helper';
import { expect, test } from 'vitest';

test('correct read globals from CommonJS', async () => {
  const fixturePath = __dirname;
  const { entryFiles } = await buildAndGetResults({
    fixturePath,
  });

  const { fn } = require(entryFiles.umd);
  expect(await fn('ok')).toBe('DEBUG:18.3.1/ok');
});
