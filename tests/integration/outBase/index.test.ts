import { join } from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { describe, expect, test } from 'vitest';

describe('outBase', async () => {
  test('base', async () => {
    const fixturePath = join(__dirname, 'nested-dir');
    const { files } = await buildAndGetResults({
      fixturePath,
    });

    expect(files.esm0!.sort()).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/outBase/nested-dir/dist/esm0/bar/index.js",
        "<ROOT>/tests/integration/outBase/nested-dir/dist/esm0/foo/index.js",
        "<ROOT>/tests/integration/outBase/nested-dir/dist/esm0/index.js",
      ]
    `);

    expect(files.esm1!.sort()).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/outBase/nested-dir/dist/esm1/utils/bar/index.js",
        "<ROOT>/tests/integration/outBase/nested-dir/dist/esm1/utils/foo/index.js",
        "<ROOT>/tests/integration/outBase/nested-dir/dist/esm1/utils/index.js",
      ]
    `);

    expect(files.esm2!.sort()).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/outBase/nested-dir/dist/esm2/utils/bar/index.js",
        "<ROOT>/tests/integration/outBase/nested-dir/dist/esm2/utils/foo/index.js",
        "<ROOT>/tests/integration/outBase/nested-dir/dist/esm2/utils/index.js",
      ]
    `);
  });

  test('with custom entry', async () => {
    const fixturePath = join(__dirname, 'custom-entry');
    const { files } = await buildAndGetResults({
      fixturePath,
    });

    expect(files.esm0!.sort()).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/outBase/custom-entry/dist/esm0/index.js",
      ]
    `);

    expect(files.esm1!.sort()).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/outBase/custom-entry/dist/esm1/foo/index.js",
      ]
    `);

    expect(files.esm2!.sort()).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/outBase/custom-entry/dist/esm2/foo/index.js",
      ]
    `);
  });
});
