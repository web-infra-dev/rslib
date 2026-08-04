import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';

test('createRequire parser', async () => {
  const fixturePath = join(__dirname, 'static-require');
  const { entries, entryFiles } = await buildAndGetResults({ fixturePath });

  for (const format of ['esm0', 'cjs0'] as const) {
    expect(entries[format]).toContain('module.exports = 42');
    expect(entries[format]).not.toContain('createRequire(');

    const result = await import(entryFiles[format]!);
    expect(result.value).toBe(42);
  }

  for (const format of ['esm1', 'cjs1'] as const) {
    expect(entries[format]).toContain('createRequire');
    expect(entries[format]).toMatch(/\(['"]\.\/answer['"]\)/);
    expect(entries[format]).not.toContain('module.exports = 42');
  }
});
