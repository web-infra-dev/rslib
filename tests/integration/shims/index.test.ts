import fs from 'node:fs';
import path, { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { describe, expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';

describe('ESM shims', async () => {
  const fixturePath = join(__dirname, 'esm');
  const { entries, entryFiles } = await buildAndGetResults({ fixturePath });
  const entry0Result = (await import(entryFiles.esm0!)).default();

  test('__dirname', async () => {
    for (const shim of [
      'import { fileURLToPath as __webpack_fileURLToPath__ } from "node:url";',
      'var src_dirname = __webpack_dirname__(__webpack_fileURLToPath__(import.meta.url));',
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
      'var src_filename = __webpack_fileURLToPath__(import.meta.url);',
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
    expect(entries.esm2).toMatchInlineSnapshot(`
      "import __rslib_shim_module__ from 'module';
      const require = /*#__PURE__*/ __rslib_shim_module__.createRequire(import.meta.url);
      const randomFile = require(process.env.RANDOM_FILE);
      export { randomFile };
      "
    `);
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
    // `module.require` is not available in Rstest runner context. Manually create a context to run the CJS code.
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
      "import { createRequire } from "node:module";
      import { fileURLToPath } from "url";
      const importMetaUrl = import.meta.url;
      const src_require = createRequire(import.meta.url);
      const requiredModule = src_require('./ok.cjs');
      const src_filename = fileURLToPath(import.meta.url);
      console.log(src_filename);
      const src_module = null;
      export { src_filename as __filename, importMetaUrl, src_module as module, requiredModule };
      "
    `);
  });
});

describe('shims with copy', () => {
  test('the CJS shims should not affect files in `output.copy`', async () => {
    const fixturePath = join(__dirname, 'copy');
    await buildAndGetResults({ fixturePath });
    const copiedFile = path.resolve(fixturePath, 'dist/cjs/index.ts');
    const copiedContent = fs.readFileSync(copiedFile, 'utf-8');
    expect(copiedContent).toMatchInlineSnapshot(`
      "#!/user/bin/env node

      export default 'ok';
      "
    `);
  });
});
