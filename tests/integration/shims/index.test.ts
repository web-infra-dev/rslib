import path, { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { buildAndGetResults } from 'test-helper';
import { describe, expect, test } from 'vitest';

describe('ESM shims', async () => {
  const fixturePath = join(__dirname, 'esm');
  const { entries, entryFiles } = await buildAndGetResults({ fixturePath });
  const entry0Result = (await import(entryFiles.esm0!)).default();

  test('__dirname', async () => {
    for (const shim of [
      'import { fileURLToPath as __webpack_fileURLToPath__ } from "node:url";',
      'var src_rslib_entry_dirname = __webpack_dirname__(__webpack_fileURLToPath__(import.meta.url));',
    ]) {
      expect(entries.esm0).toContain(shim);
    }
    expect(entry0Result.d1).toBe(path.dirname(entryFiles.esm0!));
    expect(entry0Result.d1).toBe(entry0Result.d2);

    expect(entries.esm0).toBe(entries.esm1);
  });

  test('__filename', async () => {
    for (const shim of [
      'import { fileURLToPath as __webpack_fileURLToPath__ } from "node:url";',
      'var src_rslib_entry_filename = __webpack_fileURLToPath__(import.meta.url);',
    ]) {
      expect(entries.esm0).toContain(shim);
    }
    expect(entry0Result.f1).toBe(entryFiles.esm0);
    expect(entry0Result.f1).toBe(entry0Result.f2);

    expect(entries.esm0).toBe(entries.esm1);
  });

  test('import.meta.url', async () => {
    for (const shouldPreserve of [
      // import.meta.url should not be substituted
      'const importMetaUrl = import.meta.url;',
    ]) {
      expect(entries.esm0).toContain(shouldPreserve);
    }
    expect(entry0Result.importMetaUrl).toBe(
      pathToFileURL(entryFiles.esm0!).href,
    );
  });

  test('require', async () => {
    const { ok, okPath } = await import(entryFiles.esm2!);
    expect(ok).toBe('ok');
    expect(okPath).toBe(path.resolve(path.dirname(entryFiles.esm2!), 'ok.cjs'));
  });
});

describe('ESM shims disabled', async () => {
  test('using require in ESM without shim will cause runtime error', async () => {
    const fixturePath = join(__dirname, 'esm');
    const { entries } = await buildAndGetResults({
      fixturePath,
      configPath: './rslibShimsDisabled.config.ts',
    });

    expect(entries.esm0).not.toContain('fileURLToPath');

    const context = vm.createContext({});
    const module = new vm.SourceTextModule(entries.esm1!, {
      context,
    });

    const linker: vm.ModuleLinker = async (specifier) => {
      throw new Error(`Unable to resolve dependency: ${specifier}`);
    };

    await module.link(linker);
    await expect(module.evaluate()).rejects.toThrow('require is not defined');
  });
});

describe('CJS shims', () => {
  test('import.meta.url', async () => {
    const fixturePath = join(__dirname, 'cjs');
    const { entryFiles, entries } = await buildAndGetResults({ fixturePath });
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
    expect(
      cjsCode.startsWith(
        `"use strict";\nconst __rslib_import_meta_url__ = /*#__PURE__*/ function() {`,
      ),
    ).toBe(true);
  });

  test('ESM should not be affected by CJS shims configuration', async () => {
    const fixturePath = join(__dirname, 'cjs');
    const { entries } = await buildAndGetResults({ fixturePath });
    expect(entries.esm).toMatchInlineSnapshot(`
      "import * as __WEBPACK_EXTERNAL_MODULE_node_module_ab9f2194__ from "node:module";
      import * as __WEBPACK_EXTERNAL_MODULE_url__ from "url";
      const importMetaUrl = import.meta.url;
      const src_rslib_entry_require = (0, __WEBPACK_EXTERNAL_MODULE_node_module_ab9f2194__.createRequire)(import.meta.url);
      const requiredModule = src_rslib_entry_require('./ok.cjs');
      const src_rslib_entry_filename = (0, __WEBPACK_EXTERNAL_MODULE_url__.fileURLToPath)(import.meta.url);
      console.log(src_rslib_entry_filename);
      const src_rslib_entry_module = null;
      export { src_rslib_entry_filename as __filename, importMetaUrl, src_rslib_entry_module as module, requiredModule };
      "
    `);
  });
});
