import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';

test('createRequire parser should be enabled by default', async () => {
  const fixturePath = join(__dirname, 'static-require');
  const { entries } = await buildAndGetResults({ fixturePath });

  for (const content of [entries.esm, entries.cjs]) {
    expect(content).toContain(
      'const value = __webpack_require__("./src/answer.ts")',
    );
    expect(content).not.toContain('createRequire');
  }
});
