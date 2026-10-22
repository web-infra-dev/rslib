import { describe, expect, test } from '@rstest/core';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { buildAndGetResults, createTempFiles, queryContent } from 'test-helper';

describe('dts with JavaScript API when bundle: true', () => {
  test('basic', async () => {
    const fixturePath = join(__dirname, 'basic');
    const { files, entries } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.esm).toMatchInlineSnapshot(
      `
      [
        "<ROOT>/tests/integration/dts-api-new/bundle/basic/dist/esm/index.d.ts",
      ]
    `,
    );

    expect(files.cjs).toMatchInlineSnapshot(
      `
      [
        "<ROOT>/tests/integration/dts-api-new/bundle/basic/dist/cjs/index.d.ts",
      ]
    `,
    );

    expect(entries).toMatchSnapshot();
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
        "<ROOT>/tests/integration/dts-api-new/bundle/dist-path/dist/custom/index.d.ts",
      ]
    `,
    );
  });

  test('abortOnError: false preserves JavaScript output but skips declaration bundling', async () => {
    const { js, dts } = await buildAndGetResults({
      fixturePath: join(__dirname, 'abort-on-error'),
      type: 'all',
    });

    expect(js.isSuccess).toBe(true);
    expect(js.files.esm).toHaveLength(1);
    expect(js.entries.esm).toContain('getA');
    expect(dts.files).toEqual({});
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
        "<ROOT>/tests/integration/dts-api-new/bundle/auto-extension/dist/cjs/index.d.cts",
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
        "<ROOT>/tests/integration/dts-api-new/bundle/bundle-name/dist/esm/bundleName.d.ts",
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
        "<ROOT>/tests/integration/dts-api-new/bundle/absolute-entry/dist/esm/index.d.ts",
      ]
    `,
    );
  });

  test('resolves declaration entries with a custom rootDir', async () => {
    const fixturePath = join(__dirname, 'rootdir');
    const { files, entries } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-api-new/bundle/rootdir/dist/esm/index.d.ts",
      ]
    `);

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-api-new/bundle/rootdir/dist/cjs/index.d.ts",
      ]
    `);

    expect(entries).toMatchSnapshot();
  });

  test('should clean dts dist files and temporary declaration files', async () => {
    const fixturePath = join(__dirname, 'clean');

    const checkFiles = await createTempFiles(fixturePath, true);

    const { files } = await buildAndGetResults({ fixturePath, type: 'dts' });

    for (const file of checkFiles) {
      expect(existsSync(file)).toBe(false);
    }

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-api-new/bundle/clean/dist-types/esm/index.d.ts",
      ]
    `);

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-api-new/bundle/clean/dist-types/cjs/index.d.ts",
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
        "<ROOT>/tests/integration/dts-api-new/bundle/multiple-entries/dist/esm/index.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle/multiple-entries/dist/esm/sum.d.ts",
      ]
    `);

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-api-new/bundle/multiple-entries/dist/cjs/index.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle/multiple-entries/dist/cjs/sum.d.ts",
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
