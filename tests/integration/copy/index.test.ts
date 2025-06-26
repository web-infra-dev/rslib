import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import { buildAndGetResults, generateFileTree } from 'test-helper';

test('copy', async () => {
  const fixturePath = __dirname;
  await buildAndGetResults({ fixturePath });

  const fileTree = generateFileTree(join(fixturePath, './dist/esm'));
  expect(fileTree).toMatchInlineSnapshot(`
    {
      "index.js": "<ROOT>/tests/integration/copy/dist/esm/index.js",
      "temp-1": {
        "b.png": "<ROOT>/tests/integration/copy/dist/esm/temp-1/b.png",
      },
      "temp-2": {
        "a.png": "<ROOT>/tests/integration/copy/dist/esm/temp-2/a.png",
      },
      "temp-3": {
        "a.png": "<ROOT>/tests/integration/copy/dist/esm/temp-3/a.png",
        "b.txt": "<ROOT>/tests/integration/copy/dist/esm/temp-3/b.txt",
      },
      "temp-4": {
        "_index.html": "<ROOT>/tests/integration/copy/dist/esm/temp-4/_index.html",
      },
      "temp-5": {
        "index.html": "<ROOT>/tests/integration/copy/dist/esm/temp-5/index.html",
      },
      "temp-6": {
        "index.html": "<ROOT>/tests/integration/copy/dist/esm/temp-6/index.html",
      },
    }
  `);
});
