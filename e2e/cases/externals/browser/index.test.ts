import { join } from 'node:path';
import { expect, test } from 'vitest';
import { buildAndGetEntryJsResults } from '#shared';

test('should fail to build when `output.target` is not "node"', async () => {
  const fixturePath = join(__dirname);
  const build = buildAndGetEntryJsResults(fixturePath);
  await expect(build).rejects.toThrowError('Rspack build failed!');
});
