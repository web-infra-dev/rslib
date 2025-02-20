import { existsSync } from 'node:fs';
import { join, normalize } from 'node:path';
import stripAnsi from 'strip-ansi';
import {
  buildAndGetResults,
  createTempFiles,
  globContentJSON,
  proxyConsole,
} from 'test-helper';
import { describe, expect, test } from 'vitest';

describe('dts when bundle: false', () => {
  test('basic', async () => {
    const fixturePath = join(__dirname, 'bundle-false', 'basic');
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
    const fixturePath = join(__dirname, 'bundle-false', 'false');
    const { files } = await buildAndGetResults({ fixturePath, type: 'dts' });

    expect(files.esm).toMatchInlineSnapshot('undefined');
  });

  test('dts true', async () => {
    const fixturePath = join(__dirname, 'bundle-false', 'true');
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
    const fixturePath = join(__dirname, 'bundle-false', 'dist-path');
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
    const fixturePath = join(__dirname, 'bundle-false', 'abort-on-error');
    const { isSuccess } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(isSuccess).toBe(true);
  });

  test('autoExtension: true', async () => {
    const fixturePath = join(__dirname, 'bundle-false', 'auto-extension');
    const { files } = await buildAndGetResults({ fixturePath, type: 'dts' });

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/bundle-false/auto-extension/dist/cjs/index.d.cts",
        "<ROOT>/tests/integration/dts/bundle-false/auto-extension/dist/cjs/sum.d.cts",
        "<ROOT>/tests/integration/dts/bundle-false/auto-extension/dist/cjs/utils/numbers.d.cts",
        "<ROOT>/tests/integration/dts/bundle-false/auto-extension/dist/cjs/utils/strings.d.cts",
      ]
    `);
  });

  test('should use declarationDir when not set dts.distPath', async () => {
    const fixturePath = join(__dirname, 'bundle-false', 'declaration-dir');
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
    const fixturePath = join(__dirname, 'bundle-false', 'clean');

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
    const fixturePath = join(__dirname, 'bundle-false', 'tsconfig-path');
    await createTempFiles(fixturePath, false);

    const { logs, restore } = proxyConsole();
    try {
      await buildAndGetResults({ fixturePath, type: 'dts' });
    } catch (err: any) {
      expect(logs.map((log) => stripAnsi(log)).join('')).toMatchInlineSnapshot(
        `"error   Failed to resolve tsconfig file "../path_not_exist/tsconfig.json" from <ROOT>/tests/integration/dts/bundle-false/tsconfig-path. Please ensure that the file exists."`,
      );
    }
    restore();
  });
});

describe('dts when bundle: true', () => {
  test('basic', async () => {
    const fixturePath = join(__dirname, 'bundle', 'basic');
    const { files, entries } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.esm).toMatchInlineSnapshot(
      `
      [
        "<ROOT>/tests/integration/dts/bundle/basic/dist/esm/index.d.ts",
      ]
    `,
    );

    expect(files.cjs).toMatchInlineSnapshot(
      `
      [
        "<ROOT>/tests/integration/dts/bundle/basic/dist/cjs/index.d.ts",
      ]
    `,
    );

    expect(entries).toMatchSnapshot();
  });

  test('dts false', async () => {
    const fixturePath = join(__dirname, 'bundle', 'false');
    const { files } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.esm).toMatchInlineSnapshot('undefined');
  });

  test('dts true', async () => {
    const fixturePath = join(__dirname, 'bundle', 'true');
    const { files } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.esm).toMatchInlineSnapshot(
      `
      [
        "<ROOT>/tests/integration/dts/bundle/true/dist/esm/index.d.ts",
        "<ROOT>/tests/integration/dts/bundle/true/dist/esm/sum.d.ts",
        "<ROOT>/tests/integration/dts/bundle/true/dist/esm/utils/numbers.d.ts",
        "<ROOT>/tests/integration/dts/bundle/true/dist/esm/utils/strings.d.ts",
      ]
    `,
    );
  });

  test('distPath', async () => {
    const fixturePath = join(__dirname, 'bundle', 'dist-path');
    const { files } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.esm).toMatchInlineSnapshot(
      `
      [
        "<ROOT>/tests/integration/dts/bundle/dist-path/dist/custom/index.d.ts",
      ]
    `,
    );
  });

  test('abortOnError: false', async () => {
    const fixturePath = join(__dirname, 'bundle', 'abort-on-error');
    const { isSuccess } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(isSuccess).toBe(true);
  });

  test('autoExtension: true', async () => {
    const fixturePath = join(__dirname, 'bundle', 'auto-extension');
    const { files } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.cjs).toMatchInlineSnapshot(
      `
      [
        "<ROOT>/tests/integration/dts/bundle/auto-extension/dist/cjs/index.d.cts",
      ]
    `,
    );
  });

  test('bundleName -- set source.entry', async () => {
    const fixturePath = join(__dirname, 'bundle', 'bundle-name');
    const { files } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.esm).toMatchInlineSnapshot(
      `
      [
        "<ROOT>/tests/integration/dts/bundle/bundle-name/dist/esm/bundleName.d.ts",
      ]
    `,
    );
  });

  test('entry is an absolute path', async () => {
    const fixturePath = join(__dirname, 'bundle', 'absolute-entry');
    const { files } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.esm).toMatchInlineSnapshot(
      `
      [
        "<ROOT>/tests/integration/dts/bundle/absolute-entry/dist/esm/index.d.ts",
      ]
    `,
    );
  });

  test('rootdir calculation should ignore declaration files', async () => {
    const fixturePath = join(__dirname, 'bundle', 'rootdir');
    const { files, entries } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/bundle/rootdir/dist/esm/index.d.ts",
      ]
    `);

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/bundle/rootdir/dist/cjs/index.d.ts",
      ]
    `);

    expect(entries).toMatchSnapshot();
  });

  test('should clean dts dist files and .rslib folder', async () => {
    const fixturePath = join(__dirname, 'bundle', 'clean');

    const checkFiles = await createTempFiles(fixturePath, true);

    const { files } = await buildAndGetResults({ fixturePath, type: 'dts' });

    for (const file of checkFiles) {
      expect(existsSync(file)).toBe(false);
    }

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/bundle/clean/dist-types/esm/index.d.ts",
      ]
    `);

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/bundle/clean/dist-types/cjs/index.d.ts",
      ]
    `);
  });
});

describe('dts when build: true', () => {
  test('basic', async () => {
    const fixturePath = join(__dirname, 'build', 'basic');
    const { files } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/build/basic/dist/esm/index.d.ts",
        "<ROOT>/tests/integration/dts/build/basic/dist/esm/sum.d.ts",
      ]
    `);

    const referenceDistPath = join(
      fixturePath,
      '../__references__/dist/index.d.ts',
    );
    expect(existsSync(referenceDistPath)).toBeTruthy();

    const buildInfoPath = join(fixturePath, 'tsconfig.tsbuildinfo');
    expect(existsSync(buildInfoPath)).toBeTruthy();
  });

  test('distPath', async () => {
    const fixturePath = join(__dirname, 'build', 'dist-path');
    const { files } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/build/dist-path/dist/custom/index.d.ts",
      ]
    `);

    const buildInfoPath = join(fixturePath, 'tsconfig.tsbuildinfo');
    expect(existsSync(buildInfoPath)).toBeTruthy();
  });

  test('process files - auto extension and banner / footer', async () => {
    const fixturePath = join(__dirname, 'build', 'process-files');
    const { contents } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(contents.esm).toMatchInlineSnapshot(`
      {
        "<ROOT>/tests/integration/dts/build/process-files/dist/esm/index.d.mts": "/*! hello banner dts build*/
      export declare const num1 = 1;

      /*! hello banner dts build*/
      ",
      }
    `);

    const buildInfoPath = join(fixturePath, 'tsconfig.tsbuildinfo');
    expect(existsSync(buildInfoPath)).toBeTruthy();
  });

  test('abortOnError: false', async () => {
    const fixturePath = join(__dirname, 'build', 'abort-on-error');
    const { isSuccess } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(isSuccess).toBe(true);

    const buildInfoPath = join(fixturePath, 'tsconfig.tsbuildinfo');
    expect(existsSync(buildInfoPath)).toBeTruthy();
  });

  test('tsconfig missing some fields - declarationDir or outDir', async () => {
    const fixturePath = join(__dirname, 'build', 'tsconfig');
    try {
      await buildAndGetResults({
        fixturePath,
        type: 'dts',
      });
    } catch (err: any) {
      // not easy to proxy child process stdout
      expect(err.message).toBe('Error occurred in esm DTS generation');
    }
  });

  test('should clean dts dist files', async () => {
    const fixturePath = join(__dirname, 'build', 'clean');

    const checkFiles = await createTempFiles(fixturePath, false);

    const { files } = await buildAndGetResults({ fixturePath, type: 'dts' });

    for (const file of checkFiles) {
      expect(existsSync(file)).toBe(false);
    }

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/build/clean/dist-types/esm/index.d.ts",
        "<ROOT>/tests/integration/dts/build/clean/dist-types/esm/sum.d.ts",
      ]
    `);

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/build/clean/dist-types/cjs/index.d.ts",
        "<ROOT>/tests/integration/dts/build/clean/dist-types/cjs/sum.d.ts",
      ]
    `);

    const referenceDistPath = join(
      fixturePath,
      '../__references__/dist/index.d.ts',
    );
    expect(existsSync(referenceDistPath)).toBeTruthy();

    const cjsBuildInfoPath = join(fixturePath, 'tsconfig.cjs.tsbuildinfo');
    expect(existsSync(cjsBuildInfoPath)).toBeTruthy();

    const esmBuildInfoPath = join(fixturePath, 'tsconfig.esm.tsbuildinfo');
    expect(existsSync(esmBuildInfoPath)).toBeTruthy();
  });
});

describe('dts when composite: true', () => {
  test('basic', async () => {
    const fixturePath = join(__dirname, 'composite', 'basic');
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
    const fixturePath = join(__dirname, 'composite', 'abort-on-error');
    const { isSuccess } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(isSuccess).toBe(true);

    const buildInfoPath = join(fixturePath, 'tsconfig.tsbuildinfo');
    expect(existsSync(buildInfoPath)).toBeTruthy();
  });

  test('distPath', async () => {
    const fixturePath = join(__dirname, 'composite', 'dist-path');
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

  test('process files - auto extension and banner / footer', async () => {
    const fixturePath = join(__dirname, 'composite', 'process-files');
    const { contents } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(contents.esm).toMatchInlineSnapshot(`
      {
        "<ROOT>/tests/integration/dts/composite/process-files/dist/esm/index.d.mts": "/*! hello banner dts composite*/
      export * from './utils/numbers';
      export * from './utils/strings';
      export * from './sum';

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
    const fixturePath = join(__dirname, 'composite', 'clean');

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
});

describe('use with other features', async () => {
  test('use output.copy to copy dts files', async () => {
    const fixturePath = join(__dirname, 'copy');
    const { files } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/copy/dist/esm/copy.d.ts",
        "<ROOT>/tests/integration/dts/copy/dist/esm/index.d.ts",
      ]
    `);
  });
});

describe('check tsconfig.json field', async () => {
  test('check whether declarationDir is resolved outside from project root', async () => {
    const fixturePath = join(__dirname, 'check', 'outside-root');
    const { logs, restore } = proxyConsole();
    const { files } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });
    const logStrings = logs.map((log) => stripAnsi(log));

    expect(files.esm).toMatchInlineSnapshot('undefined');
    expect(
      logStrings.some((log) =>
        log.includes(
          `The resolved declarationDir ${normalize(join(__dirname, 'check/tsconfig/dist'))} is outside the project root ${normalize(join(__dirname, 'check/outside-root'))}, please check your tsconfig file.`,
        ),
      ),
    ).toEqual(true);

    restore();
  });
});
