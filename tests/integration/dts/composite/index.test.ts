import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from '@rstest/core';
import {
  buildAndGetResults,
  createTempFiles,
  queryContent,
  runCliSync,
} from 'test-helper';

describe('dts when composite: true', () => {
  test('basic', async () => {
    const fixturePath = join(__dirname, 'basic');
    const { files } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/composite/basic/dist/esm/index.d.ts",
        "<ROOT>/tests/integration/dts/composite/basic/dist/esm/sum.d.ts",
        "<ROOT>/tests/integration/dts/composite/basic/dist/esm/utils/numbers.d.ts",
        "<ROOT>/tests/integration/dts/composite/basic/dist/esm/utils/strings.d.ts",
      ]
    `);

    const buildInfoPath = join(fixturePath, 'tsconfig.tsbuildinfo');
    expect(existsSync(buildInfoPath)).toBeTruthy();
  });

  test('abortOnError: false', async () => {
    const fixturePath = join(__dirname, 'abort-on-error');

    const { status } = runCliSync('build', {
      cwd: fixturePath,
      // do not show output in test console
      stdio: 'ignore',
    });

    expect(status).toBe(0);

    const buildInfoPath = join(fixturePath, 'tsconfig.tsbuildinfo');
    expect(existsSync(buildInfoPath)).toBeTruthy();
  });

  test('distPath', async () => {
    const fixturePath = join(__dirname, 'dist-path');
    const { files } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/composite/dist-path/dist-types/index.d.ts",
        "<ROOT>/tests/integration/dts/composite/dist-path/dist-types/sum.d.ts",
        "<ROOT>/tests/integration/dts/composite/dist-path/dist-types/utils/numbers.d.ts",
        "<ROOT>/tests/integration/dts/composite/dist-path/dist-types/utils/strings.d.ts",
      ]
    `);

    const buildInfoPath = join(fixturePath, 'tsconfig.tsbuildinfo');
    expect(existsSync(buildInfoPath)).toBeTruthy();
  });

  test('autoExtension: true', async () => {
    const fixturePath = join(__dirname, 'auto-extension');
    const { files } = await buildAndGetResults({ fixturePath, type: 'dts' });

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/composite/auto-extension/dist/types/index.d.cts",
        "<ROOT>/tests/integration/dts/composite/auto-extension/dist/types/sum.d.cts",
        "<ROOT>/tests/integration/dts/composite/auto-extension/dist/types/utils/numbers.d.cts",
        "<ROOT>/tests/integration/dts/composite/auto-extension/dist/types/utils/strings.d.cts",
      ]
    `);
  });

  test('process files - auto extension and banner / footer', async () => {
    const fixturePath = join(__dirname, 'process-files');
    const { contents } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(contents.esm).toMatchInlineSnapshot(`
      {
        "<ROOT>/tests/integration/dts/composite/process-files/dist/esm/index.d.mts": "/*! hello banner dts composite*/
      export * from './sum';
      export * from './utils/numbers';
      export * from './utils/strings';

      /*! hello banner dts composite*/
      ",
        "<ROOT>/tests/integration/dts/composite/process-files/dist/esm/sum.d.mts": "/*! hello banner dts composite*/
      export declare const numSum: number;
      export declare const strSum: string;

      /*! hello banner dts composite*/
      ",
        "<ROOT>/tests/integration/dts/composite/process-files/dist/esm/utils/numbers.d.mts": "/*! hello banner dts composite*/
      export declare const num1 = 1;
      export declare const num2 = 2;
      export declare const num3 = 3;

      /*! hello banner dts composite*/
      ",
        "<ROOT>/tests/integration/dts/composite/process-files/dist/esm/utils/strings.d.mts": "/*! hello banner dts composite*/
      export declare const str1 = "str1";
      export declare const str2 = "str2";
      export declare const str3 = "str3";

      /*! hello banner dts composite*/
      ",
      }
    `);

    const buildInfoPath = join(fixturePath, 'tsconfig.tsbuildinfo');
    expect(existsSync(buildInfoPath)).toBeTruthy();
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
        "<ROOT>/tests/integration/dts/composite/clean/dist-types/esm/index.d.ts",
        "<ROOT>/tests/integration/dts/composite/clean/dist-types/esm/sum.d.ts",
        "<ROOT>/tests/integration/dts/composite/clean/dist-types/esm/utils/numbers.d.ts",
        "<ROOT>/tests/integration/dts/composite/clean/dist-types/esm/utils/strings.d.ts",
      ]
    `);

    const buildInfoPath = join(fixturePath, 'tsconfig.tsbuildinfo');
    expect(existsSync(buildInfoPath)).toBeTruthy();
  });

  test('declarationMap', async () => {
    const fixturePath = join(__dirname, 'declaration-map');
    const { files, contents } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/composite/declaration-map/dist/esm/index.d.ts",
        "<ROOT>/tests/integration/dts/composite/declaration-map/dist/esm/index.d.ts.map",
      ]
    `);

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/composite/declaration-map/dist/cjs/index.d.cts",
        "<ROOT>/tests/integration/dts/composite/declaration-map/dist/cjs/index.d.cts.map",
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

    const buildInfoPath = join(fixturePath, 'tsconfig.tsbuildinfo');
    expect(existsSync(buildInfoPath)).toBeTruthy();
  });
});
