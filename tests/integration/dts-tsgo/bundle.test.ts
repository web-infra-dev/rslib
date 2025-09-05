import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from '@rstest/core';
import { buildAndGetResults, createTempFiles, queryContent } from 'test-helper';

describe.skipIf(process.version.startsWith('v18'))(
  'dts with tsgo when bundle: true',
  () => {
    test('basic', async () => {
      const fixturePath = join(__dirname, 'bundle', 'basic');
      const { files, entries } = await buildAndGetResults({
        fixturePath,
        type: 'dts',
      });

      expect(files.esm).toMatchInlineSnapshot(
        `
      [
        "<ROOT>/tests/integration/dts-tsgo/bundle/basic/dist/esm/index.d.ts",
      ]
    `,
      );

      expect(files.cjs).toMatchInlineSnapshot(
        `
      [
        "<ROOT>/tests/integration/dts-tsgo/bundle/basic/dist/cjs/index.d.ts",
      ]
    `,
      );

      expect(entries).toMatchSnapshot();
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
        "<ROOT>/tests/integration/dts-tsgo/bundle/dist-path/dist/custom/index.d.ts",
      ]
    `,
      );
    });

    test('abortOnError: false', async () => {
      const fixturePath = join(__dirname, 'bundle', 'abort-on-error');

      const result = spawnSync('npx', ['rslib', 'build'], {
        cwd: fixturePath,
        // do not show output in test console
        stdio: 'ignore',
        shell: true,
      });

      expect(result.status).toBe(0);
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
        "<ROOT>/tests/integration/dts-tsgo/bundle/auto-extension/dist/cjs/index.d.cts",
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
        "<ROOT>/tests/integration/dts-tsgo/bundle/bundle-name/dist/esm/bundleName.d.ts",
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
        "<ROOT>/tests/integration/dts-tsgo/bundle/absolute-entry/dist/esm/index.d.ts",
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
        "<ROOT>/tests/integration/dts-tsgo/bundle/rootdir/dist/esm/index.d.ts",
      ]
    `);

      expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-tsgo/bundle/rootdir/dist/cjs/index.d.ts",
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
        "<ROOT>/tests/integration/dts-tsgo/bundle/clean/dist-types/esm/index.d.ts",
      ]
    `);

      expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-tsgo/bundle/clean/dist-types/cjs/index.d.ts",
      ]
    `);
    });

    test('multiple entries', async () => {
      const fixturePath = join(__dirname, 'bundle', 'multiple-entries');
      const { files, contents } = await buildAndGetResults({
        fixturePath,
        type: 'dts',
      });

      expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-tsgo/bundle/multiple-entries/dist/esm/index.d.ts",
        "<ROOT>/tests/integration/dts-tsgo/bundle/multiple-entries/dist/esm/sum.d.ts",
      ]
    `);

      expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-tsgo/bundle/multiple-entries/dist/cjs/index.d.ts",
        "<ROOT>/tests/integration/dts-tsgo/bundle/multiple-entries/dist/cjs/sum.d.ts",
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
      const fixturePath = join(__dirname, 'bundle', 'bundled-packages');
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
  },
);
