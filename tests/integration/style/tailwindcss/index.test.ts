import { join } from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { expectFileContainContent } from 'test-helper/vitest';
import { expect, test } from 'vitest';

test('should extract css when using tailwindcss successfully in bundle', async () => {
  const fixturePath = join(__dirname, 'bundle');
  const { contents } = await buildAndGetResults({ fixturePath, type: 'css' });
  const esmFiles = Object.keys(contents.esm);
  expect(esmFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/tailwindcss/bundle/dist/esm/index.css",
    ]
  `);
  expectFileContainContent(contents.esm, 'index.css', [
    '.text-3xl {',
    '.font-bold {',
    '.underline {',
  ]);

  const cjsFiles = Object.keys(contents.cjs);
  expect(cjsFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/tailwindcss/bundle/dist/cjs/index.css",
    ]
  `);
  expectFileContainContent(contents.cjs, 'index.css', [
    '.text-3xl {',
    '.font-bold {',
    '.underline {',
  ]);
});
