import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';

test('should extract css successfully with `output.injectStyles = true` in bundle', async () => {
  const fixturePath = join(__dirname, 'bundle');
  const { contents } = await buildAndGetResults({ fixturePath, type: 'css' });
  const esmFiles = Object.keys(contents.esm ?? {});
  expect(esmFiles).toMatchInlineSnapshot('[]');

  const cjsFiles = Object.keys(contents.cjs ?? {});
  expect(cjsFiles).toMatchInlineSnapshot('[]');
});
