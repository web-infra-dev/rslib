import { join } from 'node:path';
import { buildAndGetResults } from '@e2e/helper';
import { expect, test } from 'vitest';

test('single entry bundle', async () => {
  const fixturePath = join(__dirname, 'single');
  const { files } = await buildAndGetResults(fixturePath);

  expect(files).toMatchInlineSnapshot(`
    {
      "cjs": [
        "<ROOT>/e2e/cases/entry/single/dist/cjs/index.cjs",
      ],
      "esm": [
        "<ROOT>/e2e/cases/entry/single/dist/esm/index.js",
      ],
    }
  `);
});

test('multiple entry bundle', async () => {
  const fixturePath = join(__dirname, 'multiple');
  const { files } = await buildAndGetResults(fixturePath);

  expect(files).toMatchInlineSnapshot(`
    {
      "cjs": [
        "<ROOT>/e2e/cases/entry/multiple/dist/cjs/bar.cjs",
        "<ROOT>/e2e/cases/entry/multiple/dist/cjs/index.cjs",
      ],
      "esm": [
        "<ROOT>/e2e/cases/entry/multiple/dist/esm/bar.js",
        "<ROOT>/e2e/cases/entry/multiple/dist/esm/index.js",
      ],
    }
  `);
});

test('glob entry bundleless', async () => {
  const fixturePath = join(__dirname, 'glob');
  const { files } = await buildAndGetResults(fixturePath);

  expect(files).toMatchInlineSnapshot(`
    {
      "cjs": [
        "<ROOT>/e2e/cases/entry/glob/dist/cjs/bar.cjs",
        "<ROOT>/e2e/cases/entry/glob/dist/cjs/foo.cjs",
        "<ROOT>/e2e/cases/entry/glob/dist/cjs/index.cjs",
      ],
      "esm": [
        "<ROOT>/e2e/cases/entry/glob/dist/esm/bar.js",
        "<ROOT>/e2e/cases/entry/glob/dist/esm/foo.js",
        "<ROOT>/e2e/cases/entry/glob/dist/esm/index.js",
      ],
    }
  `);
});
