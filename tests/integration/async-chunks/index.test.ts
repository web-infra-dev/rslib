import { join } from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { expect, test } from 'vitest';

test('should get correct value from async chunks', async () => {
  const fixturePath = join(__dirname, 'default');
  const { entryFiles } = await buildAndGetResults({ fixturePath });

  for (const format of ['esm', 'cjs'] as const) {
    const { foo } = await import(entryFiles[format]);
    expect(await foo()).toBe('dynamic');
  }
});
