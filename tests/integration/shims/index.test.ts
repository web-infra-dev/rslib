import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
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
    const { entryFiles, entries } = await buildAndGetResults(fixturePath);
    // `module.require` is not available in Vitest runner context. Manually create a context to run the CJS code.
    // As a temporary solution, we use `module.require` to avoid potential collision with module scope variable `require`.
    const cjsCode = entries.cjs;
    const context = vm.createContext({
      require,
      exports,
      module: { require },
      __filename: entryFiles.cjs,
    });
    const { importMetaUrl, requiredModule } = vm.runInContext(cjsCode, context);
    const fileUrl = pathToFileURL(entryFiles.cjs).href;
    expect(importMetaUrl).toBe(fileUrl);
    expect(requiredModule).toBe('ok');
  });

  test('ESM should not be affected by CJS shims configuration', async () => {
    const fixturePath = join(__dirname, 'cjs');
    const { entries } = await buildAndGetResults(fixturePath);
    expect(entries.esm).toMatchInlineSnapshot(`
      "import * as __WEBPACK_EXTERNAL_MODULE_node_module__ from \\"node:module\\";
      const importMetaUrl = import.meta.url;
      const src_require = (0, __WEBPACK_EXTERNAL_MODULE_node_module__.createRequire)(import.meta.url);
      const requiredModule = src_require('./ok.cjs');
      export { importMetaUrl, requiredModule };
      "
    `);
  });
});
