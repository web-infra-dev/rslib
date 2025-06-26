import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';

test('should get correct value from async chunks', async () => {
  const fixturePath = join(__dirname, 'default');
  const { entryFiles } = await buildAndGetResults({ fixturePath });

  for (const format of ['esm', 'cjs'] as const) {
    const { foo } = await import(entryFiles[format]);
    expect(await foo()).toBe('dynamic');
  }
});
