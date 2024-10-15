import { join } from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { expect, test } from 'vitest';

test('single entry bundle', async () => {
  const fixturePath = join(__dirname, 'single');
  const { files } = await buildAndGetResults({ fixturePath });

  expect(files).toMatchInlineSnapshot(`
    {
      "cjs": [
        "<ROOT>/tests/integration/entry/single/dist/cjs/index.cjs",
      ],
      "esm": [
        "<ROOT>/tests/integration/entry/single/dist/esm/index.js",
      ],
    }
  `);
});

test('multiple entry bundle', async () => {
  const fixturePath = join(__dirname, 'multiple');
  const { files } = await buildAndGetResults({ fixturePath });

  expect(files).toMatchInlineSnapshot(`
    {
      "cjs": [
        "<ROOT>/tests/integration/entry/multiple/dist/cjs/bar.cjs",
        "<ROOT>/tests/integration/entry/multiple/dist/cjs/index.cjs",
      ],
      "esm": [
        "<ROOT>/tests/integration/entry/multiple/dist/esm/bar.js",
        "<ROOT>/tests/integration/entry/multiple/dist/esm/index.js",
      ],
    }
  `);
});

test('glob entry bundleless', async () => {
  const fixturePath = join(__dirname, 'glob');
  const { files } = await buildAndGetResults({ fixturePath });

  expect(files).toMatchInlineSnapshot(`
    {
      "cjs": [
        "<ROOT>/tests/integration/entry/glob/dist/cjs/bar.cjs",
        "<ROOT>/tests/integration/entry/glob/dist/cjs/foo.cjs",
        "<ROOT>/tests/integration/entry/glob/dist/cjs/index.cjs",
      ],
      "esm": [
        "<ROOT>/tests/integration/entry/glob/dist/esm/bar.js",
        "<ROOT>/tests/integration/entry/glob/dist/esm/foo.js",
        "<ROOT>/tests/integration/entry/glob/dist/esm/index.js",
      ],
    }
  `);
});
