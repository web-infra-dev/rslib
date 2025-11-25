import { join } from 'node:path';
import { describe, expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';

describe('use with other features', async () => {
  test('use output.copy to copy dts files', async () => {
    const fixturePath = join(__dirname, 'copy');
    const { files } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/other-features/copy/dist/esm/copy.d.ts",
        "<ROOT>/tests/integration/dts/other-features/copy/dist/esm/index.d.ts",
      ]
    `);
  });
});
