import { join } from 'node:path';
import { describe } from 'node:test';
import { buildAndGetResults } from '@e2e/helper';
import { expect, test } from 'vitest';

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
    expect(entries.esm).toContain(shim);
  }
});

describe('shims for `import.meta.url` in CJS', () => {
  test('CJS should apply shims', async () => {
    const fixturePath = join(__dirname, 'cjs');
    const { entries } = await buildAndGetResults(fixturePath);
    for (const shim of [
      `var __rslib_import_meta_url__ = /*#__PURE__*/ function() {
    return 'undefined' == typeof document ? new (require('url'.replace('', ''))).URL('file:' + __filename).href : document.currentScript && document.currentScript.src || new URL('main.js', document.baseURI).href;
}();`,
      'console.log(__rslib_import_meta_url__);',
    ]) {
      expect(entries.cjs).toContain(shim);
    }
  });

  test('ESM should not be affected by CJS shims configuration', async () => {
    const fixturePath = join(__dirname, 'cjs');
    const { entries } = await buildAndGetResults(fixturePath);
    expect(entries.esm).toMatchInlineSnapshot(`
      "const foo = ()=>{
          console.log(import.meta.url);
      };
      export { foo };
      "
    `);
  });
});
