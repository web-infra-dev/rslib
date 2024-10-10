import { buildAndGetResults } from 'test-helper';
import { expectFileContainContent } from 'test-helper/vitest';
import { expect, test } from 'vitest';

test('should extract css successfully when using redirect.style = false', async () => {
  const fixturePath = __dirname;
  const { contents } = await buildAndGetResults(fixturePath, 'js');
  const esmFiles = Object.keys(contents.esm);
  expect(esmFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/redirect-style-false/dist/esm/index.js",
    ]
  `);
  expectFileContainContent(contents.esm, 'index.js', 'import "./index.less";');

  const cjsFiles = Object.keys(contents.cjs);
  expect(cjsFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/redirect-style-false/dist/cjs/index.cjs",
    ]
  `);
  expectFileContainContent(
    contents.cjs,
    'index.cjs',
    'require("./index.less")',
  );
});
