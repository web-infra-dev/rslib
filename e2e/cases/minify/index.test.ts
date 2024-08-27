import { join } from 'node:path';
import { buildAndGetResults } from '@e2e/helper';
import { expect, test } from 'vitest';

test('tree shaking is enabled by default, bar and baz should be shaken', async () => {
  const fixturePath = join(__dirname, 'default');
  const { entries } = await buildAndGetResults(fixturePath);
  expect(entries.esm).toMatchInlineSnapshot(`
    "// CONCATENATED MODULE: ./src/index.ts
    const foo = ()=>{};
    export { foo };
    "
  `);
});
