import { describe, expect, test } from '@rstest/core';
import { existsSync } from 'node:fs';
import { basename, join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { stripVTControlCharacters as stripAnsi } from 'node:util';
import {
  buildAndGetResults,
  createTempFiles,
  expectBuildToFail,
  globContentJSON,
  queryContent,
  runCliSync,
  rslibBuild,
} from 'test-helper';

describe('dts with JavaScript API when bundle: false', () => {
  test('basic', async () => {
    const fixturePath = join(__dirname, 'basic');
    const { files, contents } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-api-new/bundle-false/basic/dist/esm/index.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/basic/dist/esm/sum.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/basic/dist/esm/utils/numbers.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/basic/dist/esm/utils/strings.d.ts",
      ]
    `);

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-api-new/bundle-false/basic/dist/cjs/index.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/basic/dist/cjs/sum.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/basic/dist/cjs/utils/numbers.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/basic/dist/cjs/utils/strings.d.ts",
      ]
    `);

    expect(contents.esm).toMatchSnapshot();
  });

  test('distPath', async () => {
    const fixturePath = join(__dirname, 'dist-path');
    const { files } = await buildAndGetResults({ fixturePath, type: 'dts' });

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-api-new/bundle-false/dist-path/dist/custom/index.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/dist-path/dist/custom/sum.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/dist-path/dist/custom/utils/numbers.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/dist-path/dist/custom/utils/strings.d.ts",
      ]
    `);
  });

  test('abortOnError: false', async () => {
    const fixturePath = join(__dirname, 'abort-on-error');

    const { status } = runCliSync('build', {
      cwd: fixturePath,
      // do not show output in test console
      stdio: 'ignore',
    });

    expect(status).toBe(0);
  });

  test('autoExtension: true', async () => {
    const fixturePath = join(__dirname, 'auto-extension');
    const { files } = await buildAndGetResults({ fixturePath, type: 'dts' });

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-api-new/bundle-false/auto-extension/dist/types/esm/index.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/auto-extension/dist/types/esm/sum.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/auto-extension/dist/types/esm/utils/numbers.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/auto-extension/dist/types/esm/utils/strings.d.ts",
      ]
    `);

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-api-new/bundle-false/auto-extension/dist/types/cjs/index.d.cts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/auto-extension/dist/types/cjs/sum.d.cts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/auto-extension/dist/types/cjs/utils/numbers.d.cts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/auto-extension/dist/types/cjs/utils/strings.d.cts",
      ]
    `);
  });

  test('should use declarationDir when not set dts.distPath', async () => {
    const fixturePath = join(__dirname, 'declaration-dir');
    const distTypesPath = join(fixturePath, 'dist-types');

    await buildAndGetResults({ fixturePath, type: 'dts' });

    const distTypeFiles = await globContentJSON(distTypesPath, {
      absolute: true,
    });
    const distTypeFilePaths = Object.keys(distTypeFiles).sort();

    expect(distTypeFilePaths).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-api-new/bundle-false/declaration-dir/dist-types/index.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/declaration-dir/dist-types/sum.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/declaration-dir/dist-types/utils/numbers.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/declaration-dir/dist-types/utils/strings.d.ts",
      ]
    `);
  });

  test('should clean dts dist files', async () => {
    const fixturePath = join(__dirname, 'clean');

    const checkFiles = await createTempFiles(fixturePath, false);

    const { files } = await buildAndGetResults({ fixturePath, type: 'dts' });

    for (const file of checkFiles) {
      expect(existsSync(file)).toBe(false);
    }

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-api-new/bundle-false/clean/dist-types/esm/index.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/clean/dist-types/esm/sum.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/clean/dist-types/esm/utils/numbers.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/clean/dist-types/esm/utils/strings.d.ts",
      ]
    `);

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-api-new/bundle-false/clean/dist-types/cjs/index.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/clean/dist-types/cjs/sum.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/clean/dist-types/cjs/utils/numbers.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/clean/dist-types/cjs/utils/strings.d.ts",
      ]
    `);
  });

  test('should emit error when tsconfig not found', async () => {
    const fixturePath = join(__dirname, 'tsconfig-path');
    await createTempFiles(fixturePath, false);

    const err = await expectBuildToFail(
      buildAndGetResults({ fixturePath, type: 'dts' }),
    );
    expect(stripAnsi(err.message)).toMatchInlineSnapshot(
      `"Failed to resolve tsconfig file "<ROOT>/tests/integration/dts-api-new/bundle-false/tsconfig-path/path_not_exist/tsconfig.json" from <ROOT>/tests/integration/dts-api-new/bundle-false/tsconfig-path. Please ensure that the file exists."`,
    );
  });

  test('alias', async () => {
    const fixturePath = join(__dirname, 'alias');
    const { contents } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(contents.esm).toMatchInlineSnapshot(`
      {
        "<ROOT>/tests/integration/dts-api-new/bundle-false/alias/dist/esm/index.d.ts": "export {} from '../../compile/prebundle-pkg/index.js';
      ",
      }
    `);

    expect(contents.cjs).toMatchInlineSnapshot(`
      {
        "<ROOT>/tests/integration/dts-api-new/bundle-false/alias/dist/cjs/index.d.ts": "export {} from '../../compile/prebundle-pkg/index.js';
      ",
      }
    `);
  });

  test('declarationMap', async () => {
    const fixturePath = join(__dirname, 'declaration-map');
    const { files, contents } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-api-new/bundle-false/declaration-map/dist/esm/index.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/declaration-map/dist/esm/index.d.ts.map",
      ]
    `);

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-api-new/bundle-false/declaration-map/dist/cjs/index.d.cts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/declaration-map/dist/cjs/index.d.cts.map",
      ]
    `);

    const { content: indexDtsEsm } = queryContent(contents.esm, 'index.d.ts', {
      basename: true,
    });
    const { content: indexDtsCjs } = queryContent(contents.cjs, 'index.d.cts', {
      basename: true,
    });
    const { content: indexMapEsm } = queryContent(
      contents.esm,
      'index.d.ts.map',
      {
        basename: true,
      },
    );
    const { content: indexMapCjs } = queryContent(
      contents.cjs,
      'index.d.cts.map',
      {
        basename: true,
      },
    );
    expect(indexDtsEsm).toContain('//# sourceMappingURL=index.d.ts.map');
    expect(indexDtsCjs).toContain('//# sourceMappingURL=index.d.cts.map');
    expect(indexMapEsm).toContain('"file":"index.d.ts"');
    expect(indexMapCjs).toContain('"file":"index.d.cts"');
  });

  test.each([false, true])(
    'respects noEmitOnError: %s with abortOnError disabled',
    async (noEmitOnError) => {
      const fixturePath = join(__dirname, 'no-emit-on-error');
      const { buildResult } = await rslibBuild({
        cwd: fixturePath,
        modifyConfig(config) {
          config.source = {
            ...config.source,
            tsconfigPath: noEmitOnError
              ? './tsconfig.noEmitOnError.json'
              : './tsconfig.json',
          };
        },
      });
      await buildResult.close();
      const declarationFile = join(fixturePath, 'dist/esm/index.d.ts');
      expect(existsSync(declarationFile)).toBe(!noEmitOnError);
      const declaration = await readFile(declarationFile, 'utf8').catch(
        () => undefined,
      );
      expect(declaration?.trim()).toBe(
        noEmitOnError ? undefined : 'export declare const invalid: number;',
      );
    },
  );

  test('emits transitive dependencies outside tsconfig files with .d.mts maps', async () => {
    const fixturePath = join(__dirname, 'transitive-dependency');
    const { files, contents } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });
    expect(files.esm.map((file) => basename(file)).sort()).toEqual([
      'dependency.d.mts',
      'dependency.d.mts.map',
      'index.d.mts',
      'index.d.mts.map',
    ]);
    const { content: entry } = queryContent(contents.esm, 'index.d.mts', {
      basename: true,
    });
    expect(entry).toContain("export { value } from './dependency.mjs';");
    expect(entry).toContain('//# sourceMappingURL=index.d.mts.map');
    const { content: dependency } = queryContent(
      contents.esm,
      'dependency.d.mts',
      { basename: true },
    );
    expect(dependency).toContain('export declare const value = 42;');
    for (const file of ['index.d.mts', 'dependency.d.mts']) {
      const { content: map } = queryContent(contents.esm, `${file}.map`, {
        basename: true,
      });
      expect(JSON.parse(map).file).toBe(file);
    }
  });
});
