import fs from 'node:fs';
import { createRequire } from 'node:module';
import path, { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { describe, expect, test } from '@rstest/core';
import { buildAndGetResults, queryContent } from 'test-helper';

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

  test('Node.js shims in mjs file', async () => {
    for (const shim of [
      'import { fileURLToPath as __webpack_fileURLToPath__ } from "node:url";',
      'import { dirname as __webpack_dirname__ } from "node:path";',
      'var node_dirname = __webpack_dirname__(__webpack_fileURLToPath__(import.meta.url));',
      'var node_filename = __webpack_fileURLToPath__(import.meta.url);',
    ]) {
      expect(entries.esm3).toContain(shim);
    }

    const entry3Result = (await import(entryFiles.esm3!)).default();

    expect(entry3Result.d1).toBe(path.dirname(entryFiles.esm3!));
    expect(entry3Result.d1).toBe(entry3Result.d2);
    expect(entry3Result.f1).toBe(entryFiles.esm3);
    expect(entry3Result.f1).toBe(entry3Result.f2);
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
    expect(entries.esm1).not.toContain('fileURLToPath');

    const context = vm.createContext({});
    const module = new vm.SourceTextModule(entries.esm2!, {
      context,
    });

    const linker: vm.ModuleLinker = async (specifier) => {
      throw new Error(`Unable to resolve dependency: ${specifier}`);
    };

    await module.link(linker);
    await expect(module.evaluate()).rejects.toThrow('require is not defined');

    expect(entries.esm3).not.toContain('fileURLToPath');
  });
});

describe('CJS shims', () => {
  test('import.meta.url', async () => {
    const fixturePath = join(__dirname, 'cjs');
    const { entryFiles, entries, contents } = await buildAndGetResults({
      fixturePath,
    });
    // `module.require` is not available in Rstest runner context. Manually create a context to run the CJS code.
    // As a temporary solution, we use `module.require` to avoid potential collision with module scope variable `require`.
    const cjsCode = entries.cjs;
    const req = createRequire(entryFiles.cjs);
    const context = vm.createContext({
      require: req,
      exports,
      module: { require: req },
      __filename: entryFiles.cjs,
    });
    const { importMetaUrl, dynamicImportMetaUrl, requiredModule } =
      vm.runInContext(cjsCode, context);
    const fileUrl = pathToFileURL(entryFiles.cjs).href;
    const dynamicUrl = await dynamicImportMetaUrl();
    const { content: dynamicContent } = queryContent(
      contents.cjs!,
      /cjs\/1~7\.cjs/,
    );

    expect(importMetaUrl).toBe(fileUrl);
    expect(dynamicUrl).toBe(fileUrl.replace('index.cjs', '1~7.cjs'));
    expect(requiredModule).toBe('ok');

    for (const code of [cjsCode, dynamicContent]) {
      expect(
        code.startsWith(
          `"use strict";\nconst __rslib_import_meta_url__ = /*#__PURE__*/ function() {`,
        ),
      ).toBe(true);
    }
  });

  test('ESM should not be affected by CJS shims configuration', async () => {
    const fixturePath = join(__dirname, 'cjs');
    const { entries } = await buildAndGetResults({ fixturePath });

    for (const code of [
      'const importMetaUrl = import.meta.url;',
      'const src_require = createRequire(import.meta.url);',
      'const src_filename = fileURLToPath(import.meta.url);',
    ]) {
      expect(entries.esm).toContain(code);
    }
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
