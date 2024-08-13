import { join } from 'node:path';
import { buildAndGetResults } from '@e2e/helper';
import { describe, expect, test } from 'vitest';

describe('dts when bundle: false', () => {
  test('basic', async () => {
    const fixturePath = join(__dirname, 'bundle-false', 'basic');
    const { files, contents } = await buildAndGetResults(fixturePath, 'dts');

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/e2e/cases/dts/bundle-false/basic/dist/esm/index.d.ts",
        "<ROOT>/e2e/cases/dts/bundle-false/basic/dist/esm/sum.d.ts",
        "<ROOT>/e2e/cases/dts/bundle-false/basic/dist/esm/utils/numbers.d.ts",
        "<ROOT>/e2e/cases/dts/bundle-false/basic/dist/esm/utils/strings.d.ts",
      ]
    `);
    expect(contents.esm).toMatchSnapshot();
  });

  test('dts false', async () => {
    const fixturePath = join(__dirname, 'bundle-false', 'false');
    const { files } = await buildAndGetResults(fixturePath, 'dts');

    expect(files.esm).toMatchInlineSnapshot('undefined');
  });

  test('distPath', async () => {
    const fixturePath = join(__dirname, 'bundle-false', 'dist-path');
    const { files } = await buildAndGetResults(fixturePath, 'dts');

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/e2e/cases/dts/bundle-false/dist-path/dist/custom/index.d.ts",
        "<ROOT>/e2e/cases/dts/bundle-false/dist-path/dist/custom/sum.d.ts",
        "<ROOT>/e2e/cases/dts/bundle-false/dist-path/dist/custom/utils/numbers.d.ts",
        "<ROOT>/e2e/cases/dts/bundle-false/dist-path/dist/custom/utils/strings.d.ts",
      ]
    `);
  });

  test('abortOnError: false', async () => {
    const fixturePath = join(__dirname, 'bundle-false', 'abort-on-error');
    const { isSuccess } = await buildAndGetResults(fixturePath, 'dts');

    expect(isSuccess).toBe(true);
  });

  test('autoExtension: true', async () => {
    const fixturePath = join(__dirname, 'bundle-false', 'auto-extension');
    const { files } = await buildAndGetResults(fixturePath, 'dts');

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/e2e/cases/dts/bundle-false/auto-extension/dist/cjs/index.d.cts",
        "<ROOT>/e2e/cases/dts/bundle-false/auto-extension/dist/cjs/sum.d.cts",
        "<ROOT>/e2e/cases/dts/bundle-false/auto-extension/dist/cjs/utils/numbers.d.cts",
        "<ROOT>/e2e/cases/dts/bundle-false/auto-extension/dist/cjs/utils/strings.d.cts",
      ]
    `);
  });
});

describe('dts when bundle: true', () => {
  test('basic', async () => {
    const fixturePath = join(__dirname, 'bundle', 'basic');
    const { entryFiles, entries } = await buildAndGetResults(
      fixturePath,
      'dts',
    );

    expect(entryFiles.esm).toMatchInlineSnapshot(
      `"<ROOT>/e2e/cases/dts/bundle/basic/dist/esm/main.d.ts"`,
    );
    expect(entries).toMatchSnapshot();
  });

  test('dts false', async () => {
    const fixturePath = join(__dirname, 'bundle', 'false');
    const { entryFiles } = await buildAndGetResults(fixturePath, 'dts');

    expect(entryFiles.esm).toMatchInlineSnapshot('undefined');
  });

  test('distPath', async () => {
    const fixturePath = join(__dirname, 'bundle', 'dist-path');
    const { entryFiles } = await buildAndGetResults(fixturePath, 'dts');

    expect(entryFiles.esm).toMatchInlineSnapshot(
      `"<ROOT>/e2e/cases/dts/bundle/dist-path/dist/custom/main.d.ts"`,
    );
  });

  test('abortOnError: false', async () => {
    const fixturePath = join(__dirname, 'bundle', 'abort-on-error');
    const { isSuccess } = await buildAndGetResults(fixturePath, 'dts');

    expect(isSuccess).toBe(true);
  });

  test('autoExtension: true', async () => {
    const fixturePath = join(__dirname, 'bundle', 'auto-extension');
    const { entryFiles } = await buildAndGetResults(fixturePath, 'dts');

    expect(entryFiles.cjs).toMatchInlineSnapshot(
      `"<ROOT>/e2e/cases/dts/bundle/auto-extension/dist/cjs/main.d.cts"`,
    );
  });

  test('bundleName -- set source.entry', async () => {
    const fixturePath = join(__dirname, 'bundle', 'bundle-name');
    const { entryFiles } = await buildAndGetResults(fixturePath, 'dts');

    expect(entryFiles.esm).toMatchInlineSnapshot(
      `"<ROOT>/e2e/cases/dts/bundle/bundle-name/dist/esm/bundleName.d.ts"`,
    );
  });
});
