import os from 'node:os';
import { join } from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { expect, test } from 'vitest';

test('should not generate js sourcemap by default', async () => {
  const fixturePath = join(__dirname, 'default');
  const { contents } = await buildAndGetResults(fixturePath, 'js');
  const files = Object.keys(contents.esm);

  expect(files).toMatchInlineSnapshot(`
    [
      "<ROOT>/e2e/cases/sourcemap/default/dist/esm/index.js",
    ]
  `);
});

test('should generate js external sourcemap: cheap-module-source-map', async () => {
  const fixturePath = join(__dirname, 'external');
  const { contents } = await buildAndGetResults(fixturePath, 'js');
  const files = Object.keys(contents.esm);

  expect(files).toMatchInlineSnapshot(`
        [
          "<ROOT>/tests/features/sourcemap/default/dist/esm/index.js",
        ]
      `);
});

test('should generate js inline sourcemap: inline-cheap-module-source-map', async () => {
  const fixturePath = join(__dirname, 'inline');
  const { contents } = await buildAndGetResults(fixturePath, 'js');
  const files = Object.keys(contents.esm);
  const code = Object.values(contents.esm);

  expect(files).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/features/sourcemap/external/dist/esm/index.js",
      "<ROOT>/tests/features/sourcemap/external/dist/esm/index.js.map",
    ]
  `);

  if (os.platform() === 'win32') {
    expect(code).toMatchInlineSnapshot(`
      [
        "const foo = 'foo';
      export { foo };

      //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zb3VyY2VtYXAtaW5saW5lLXRlc3QvLi4vX19maXh0dXJlc19fL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgZm9vID0gJ2Zvbyc7XHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSJ9",
      ]
    `);
  } else {
    expect(code).toMatchInlineSnapshot(`
      [
        "const foo = 'foo';
      export { foo };

      //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zb3VyY2VtYXAtaW5saW5lLXRlc3QvLi4vX19maXh0dXJlc19fL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgZm9vID0gJ2Zvbyc7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEifQ==",
      ]
    `);
  }
});
