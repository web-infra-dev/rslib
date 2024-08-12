import { join } from 'node:path';
import { buildAndGetResults } from '@e2e/helper';
import { expect, test } from 'vitest';

test('shims for __dirname and __filename in ESM', async () => {
  const fixturePath = join(__dirname, 'esm');
  const { entries } = await buildAndGetResults(fixturePath);
  for (const shim of [
    'import {fileURLToPath as __webpack_fileURLToPath__} from "url";',
    "var src_dirname = __webpack_fileURLToPath__(import.meta.url + '/..').slice(0, -1);",
    'var src_filename = __webpack_fileURLToPath__(import.meta.url);',
    // import.meta.url should not be substituted
    'const importMetaUrl = import.meta.url;',
  ]) {
    expect(entries.esm).toContain(shim);
  }
});

test.todo('shims for import.meta.url in CJS', async () => {});
