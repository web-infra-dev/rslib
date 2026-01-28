import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { stripVTControlCharacters as stripAnsi } from 'node:util';
import { describe, expect, test } from '@rstest/core';
import {
  buildAndGetResults,
  createTempFiles,
  proxyConsole,
  queryContent,
  runCliSync,
} from 'test-helper';

describe('dts when bundle: true', () => {
  test('basic', async () => {
    const fixturePath = join(__dirname, 'basic');
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
    const fixturePath = join(__dirname, 'false');
    const { files } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.esm).toMatchInlineSnapshot('undefined');
  });

  test('dts true', async () => {
    const fixturePath = join(__dirname, 'true');
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
    const fixturePath = join(__dirname, 'dist-path');
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
    const fixturePath = join(__dirname, 'bundle-name');
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
    const fixturePath = join(__dirname, 'absolute-entry');
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
    const fixturePath = join(__dirname, 'rootdir');
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
    const fixturePath = join(__dirname, 'clean');

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

  test('multiple entries', async () => {
    const fixturePath = join(__dirname, 'multiple-entries');
    const { files, contents } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/bundle/multiple-entries/dist/esm/index.d.ts",
        "<ROOT>/tests/integration/dts/bundle/multiple-entries/dist/esm/sum.d.ts",
      ]
    `);

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/bundle/multiple-entries/dist/cjs/index.d.ts",
        "<ROOT>/tests/integration/dts/bundle/multiple-entries/dist/cjs/sum.d.ts",
      ]
    `);

    const { content: indexEsm } = queryContent(contents.esm, 'index.d.ts', {
      basename: true,
    });
    const { content: indexCjs } = queryContent(contents.cjs, 'index.d.ts', {
      basename: true,
    });
    const { content: sumEsm } = queryContent(contents.esm, 'sum.d.ts', {
      basename: true,
    });
    const { content: sumCjs } = queryContent(contents.cjs, 'sum.d.ts', {
      basename: true,
    });

    expect([indexEsm, indexCjs, sumEsm, sumCjs]).toMatchSnapshot();
  });

  test('can not find a valid entry', async () => {
    const fixturePath = join(__dirname, 'no-entry');
    const { restore } = proxyConsole();

    try {
      await buildAndGetResults({ fixturePath, type: 'dts' });
    } catch (err: any) {
      expect(stripAnsi(err.message)).toMatchInlineSnapshot(
        `"Can not find a valid entry for dts.bundle option, please check your entry config."`,
      );
    }

    restore();
  });

  test('override with bundledPackages', async () => {
    const fixturePath = join(__dirname, 'bundled-packages');
    const { entries } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    // default
    expect(entries.esm0).toContain(`import { Action } from 'redux';`);

    // override empty array
    expect(entries.esm1).toMatchInlineSnapshot(`
      "
      export * from "@reduxjs/toolkit";

      export { }
      "
    `);

    // override with bundledPackages
    expect(entries.esm2).not.toContain(`import { Action } from 'redux';`);
  });
});
