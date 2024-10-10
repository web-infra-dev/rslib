import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildAndGetResults } from 'test-helper';
import { describe, expect, test } from 'vitest';

test('shims for __dirname and __filename in ESM', async () => {
  const fixturePath = join(__dirname, 'esm');
  const { entries } = await buildAndGetResults(fixturePath);

  for (const shim of [
    'import { fileURLToPath as __webpack_fileURLToPath__ } from "url";',
    'var src_dirname = __webpack_dirname__(__webpack_fileURLToPath__(import.meta.url));',
    'var src_filename = __webpack_fileURLToPath__(import.meta.url);',
    // import.meta.url should not be substituted
    'const importMetaUrl = import.meta.url;',
  ]) {
    expect(entries.esm0).toContain(shim);
  }
  expect(entries.esm0).toBe(entries.esm1);
});

describe('shims for `import.meta.url` in CJS', () => {
  test('CJS should apply shims', async () => {
    const fixturePath = join(__dirname, 'cjs');
    const { entryFiles } = await buildAndGetResults(fixturePath);
    const exported = await import(entryFiles.cjs);
    const fileUrl = pathToFileURL(entryFiles.cjs).href;
    expect(exported.default).toBe(fileUrl);
  });

  test('ESM should not be affected by CJS shims configuration', async () => {
    const fixturePath = join(__dirname, 'cjs');
    const { entries } = await buildAndGetResults(fixturePath);
    expect(entries.esm).toMatchInlineSnapshot(`
      "const url = import.meta.url;
      const readUrl = url;
      /* harmony default export */ const src = readUrl;
      export { src as default };
      "
    `);
  });
});
