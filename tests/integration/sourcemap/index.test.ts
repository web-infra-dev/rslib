import { join } from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { expect, test } from 'vitest';

test('should not generate js sourcemap by default', async () => {
  const fixturePath = join(__dirname, 'default');
  const { contents } = await buildAndGetResults({ fixturePath });
  const files = Object.keys(contents.esm);

  expect(files).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/sourcemap/default/dist/esm/index.js",
    ]
  `);
});

test('should generate js external sourcemap: cheap-module-source-map', async () => {
  const fixturePath = join(__dirname, 'external');
  const { contents } = await buildAndGetResults({ fixturePath });
  const files = Object.keys(contents.esm);

  expect(files).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/sourcemap/external/dist/esm/index.js",
      "<ROOT>/tests/integration/sourcemap/external/dist/esm/index.js.map",
    ]
  `);
});

test('should generate js inline sourcemap: inline-cheap-module-source-map', async () => {
  const fixturePath = join(__dirname, 'inline');
  const { contents } = await buildAndGetResults({ fixturePath });
  const files = Object.keys(contents.esm);
  const code = Object.values(contents.esm);

  expect(files).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/sourcemap/inline/dist/esm/index.js",
    ]
  `);

  expect(code[0]).toContain('//# sourceMappingURL=data:application/json');
});

test('should generate css sourcemap file', async () => {
  const fixturePath = join(__dirname, 'css');
  const { contents } = await buildAndGetResults({ fixturePath, type: 'css' });
  const files = Object.keys(contents.esm);
  const code = Object.values(contents.esm);

  expect(files).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/sourcemap/css/dist/esm/index.css",
      "<ROOT>/tests/integration/sourcemap/css/dist/esm/index.css.map",
    ]
  `);

  expect(code[0]).toContain('/*# sourceMappingURL=index.css.map */');
});
