import { expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';
import { expectFileContainContent } from 'test-helper/rstest';

test('should output css asset', async () => {
  const fixturePath = __dirname;
  const { contents } = await buildAndGetResults({ fixturePath, type: 'css' });
  const esmFiles = Object.keys(contents.esm);
  expect(esmFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/asset/dist/esm/index.css",
    ]
  `);
  expectFileContainContent(
    contents.esm,
    'index.css',
    'background: url(./static/svg/logo.svg)',
  );

  const cjsFiles = Object.keys(contents.cjs);
  expect(cjsFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/asset/dist/cjs/index.css",
    ]
  `);
  expectFileContainContent(
    contents.cjs,
    'index.css',
    'background: url(./static/svg/logo.svg)',
  );
});
