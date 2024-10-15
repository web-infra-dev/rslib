import { join } from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { expect, test } from 'vitest';

test('should extract css successfully with `output.styleInject = true` in bundle', async () => {
  const fixturePath = join(__dirname, 'bundle');
  const { contents } = await buildAndGetResults({ fixturePath, type: 'css' });
  const esmFiles = Object.keys(contents.esm ?? {});
  expect(esmFiles).toMatchInlineSnapshot('[]');

  const cjsFiles = Object.keys(contents.cjs ?? {});
  expect(cjsFiles).toMatchInlineSnapshot('[]');
});
