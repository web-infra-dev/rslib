import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { stripVTControlCharacters as stripAnsi } from 'node:util';
import { describe, expect, test } from '@rstest/core';
import {
  buildAndGetResults,
  createTempFiles,
  globContentJSON,
  queryContent,
} from 'test-helper';

describe('dts when bundle: false', () => {
  test('basic', async () => {
    const fixturePath = join(__dirname, 'basic');
    const { files, contents } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/bundle-false/basic/dist/esm/index.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/basic/dist/esm/sum.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/basic/dist/esm/utils/numbers.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/basic/dist/esm/utils/strings.d.ts",
      ]
    `);

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/bundle-false/basic/dist/cjs/index.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/basic/dist/cjs/sum.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/basic/dist/cjs/utils/numbers.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/basic/dist/cjs/utils/strings.d.ts",
      ]
    `);

    expect(contents.esm).toMatchSnapshot();
  });

  test('dts false', async () => {
    const fixturePath = join(__dirname, 'false');
    const { files } = await buildAndGetResults({ fixturePath, type: 'dts' });

    expect(files.esm).toMatchInlineSnapshot('undefined');
  });

  test('dts true', async () => {
    const fixturePath = join(__dirname, 'true');
    const { files } = await buildAndGetResults({ fixturePath, type: 'dts' });

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/bundle-false/true/dist/esm/index.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/true/dist/esm/sum.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/true/dist/esm/utils/numbers.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/true/dist/esm/utils/strings.d.ts",
      ]
    `);
  });

  test('distPath', async () => {
    const fixturePath = join(__dirname, 'dist-path');
    const { files } = await buildAndGetResults({ fixturePath, type: 'dts' });

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/bundle-false/dist-path/dist/custom/index.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/dist-path/dist/custom/sum.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/dist-path/dist/custom/utils/numbers.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/dist-path/dist/custom/utils/strings.d.ts",
      ]
    `);
  });

  test('abortOnError: false', async () => {
    const fixturePath = join(__dirname, 'abort-on-error');

    const result = spawnSync('npx', ['rslib', 'build'], {
      cwd: fixturePath,
      // do not show output in test console
      stdio: 'ignore',
      shell: true,
    });

    expect(result.status).toBe(0);
  });

  test('autoExtension: true', async () => {
    const fixturePath = join(__dirname, 'auto-extension');
    const { files } = await buildAndGetResults({ fixturePath, type: 'dts' });

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/bundle-false/auto-extension/dist/types/index.d.cts",
        "<ROOT>/tests/integration/dts/bundle-false/auto-extension/dist/types/index.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/auto-extension/dist/types/sum.d.cts",
        "<ROOT>/tests/integration/dts/bundle-false/auto-extension/dist/types/sum.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/auto-extension/dist/types/utils/numbers.d.cts",
        "<ROOT>/tests/integration/dts/bundle-false/auto-extension/dist/types/utils/numbers.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/auto-extension/dist/types/utils/strings.d.cts",
        "<ROOT>/tests/integration/dts/bundle-false/auto-extension/dist/types/utils/strings.d.ts",
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
        "<ROOT>/tests/integration/dts/bundle-false/declaration-dir/dist-types/index.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/declaration-dir/dist-types/sum.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/declaration-dir/dist-types/utils/numbers.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/declaration-dir/dist-types/utils/strings.d.ts",
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
        "<ROOT>/tests/integration/dts/bundle-false/clean/dist-types/esm/index.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/clean/dist-types/esm/sum.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/clean/dist-types/esm/utils/numbers.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/clean/dist-types/esm/utils/strings.d.ts",
      ]
    `);

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/bundle-false/clean/dist-types/cjs/index.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/clean/dist-types/cjs/sum.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/clean/dist-types/cjs/utils/numbers.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/clean/dist-types/cjs/utils/strings.d.ts",
      ]
    `);
  });

  test('should emit error when tsconfig not found', async () => {
    const fixturePath = join(__dirname, 'tsconfig-path');
    await createTempFiles(fixturePath, false);

    try {
      await buildAndGetResults({ fixturePath, type: 'dts' });
    } catch (err: any) {
      expect(stripAnsi(err.message)).toMatchInlineSnapshot(
        `"Failed to resolve tsconfig file "<ROOT>/tests/integration/dts/bundle-false/tsconfig-path/path_not_exist/tsconfig.json" from <ROOT>/tests/integration/dts/bundle-false/tsconfig-path. Please ensure that the file exists."`,
      );
    }
  });

  test('alias', async () => {
    const fixturePath = join(__dirname, 'alias');
    const { contents } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(contents.esm).toMatchInlineSnapshot(`
      {
        "<ROOT>/tests/integration/dts/bundle-false/alias/dist/esm/index.d.ts": "export {} from '../../compile/prebundle-pkg';
      ",
      }
    `);

    expect(contents.cjs).toMatchInlineSnapshot(`
      {
        "<ROOT>/tests/integration/dts/bundle-false/alias/dist/cjs/index.d.ts": "export {} from '../../compile/prebundle-pkg';
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
        "<ROOT>/tests/integration/dts/bundle-false/declaration-map/dist/esm/index.d.ts",
        "<ROOT>/tests/integration/dts/bundle-false/declaration-map/dist/esm/index.d.ts.map",
      ]
    `);

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/bundle-false/declaration-map/dist/cjs/index.d.cts",
        "<ROOT>/tests/integration/dts/bundle-false/declaration-map/dist/cjs/index.d.cts.map",
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
});
