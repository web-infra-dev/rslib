import path from 'node:path';
import { describe, expect, test } from '@rstest/core';
import fse from 'fs-extra';
import { globContentJSON, runCliSync } from 'test-helper';

describe('inspect command', async () => {
  test('basic', async () => {
    await fse.remove(path.join(__dirname, 'dist'));
    runCliSync('inspect', {
      cwd: __dirname,
    });

    const files = await globContentJSON(path.join(__dirname, 'dist/.rsbuild'));
    const fileNames = Object.keys(files).sort();

    expect(fileNames).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/cli/inspect/dist/.rsbuild/rsbuild.config.cjs.mjs",
        "<ROOT>/tests/integration/cli/inspect/dist/.rsbuild/rsbuild.config.esm.mjs",
        "<ROOT>/tests/integration/cli/inspect/dist/.rsbuild/rspack.config.cjs.mjs",
        "<ROOT>/tests/integration/cli/inspect/dist/.rsbuild/rspack.config.esm.mjs",
      ]
    `);

    // esm rsbuild config
    const rsbuildConfigEsm = fileNames.find((item) =>
      item.includes('rsbuild.config.esm.mjs'),
    );
    expect(rsbuildConfigEsm).toBeTruthy();
    expect(files[rsbuildConfigEsm!]).toContain("type: 'modern-module'");

    // esm rspack config
    const rspackConfigEsm = fileNames.find((item) =>
      item.includes('rspack.config.esm.mjs'),
    );
    expect(rspackConfigEsm).toBeTruthy();
    expect(files[rspackConfigEsm!]).toContain("type: 'modern-module'");
  });

  test('--lib', async () => {
    await fse.remove(path.join(__dirname, 'dist'));
    runCliSync('inspect --lib esm', {
      cwd: __dirname,
    });

    const files = await globContentJSON(
      path.join(__dirname, 'dist/esm/.rsbuild'),
    );
    const fileNames = Object.keys(files).sort();

    // Rsbuild will emit dump files to `dist/esm` if only one environment is specified.
    expect(fileNames).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/cli/inspect/dist/esm/.rsbuild/rsbuild.config.mjs",
        "<ROOT>/tests/integration/cli/inspect/dist/esm/.rsbuild/rspack.config.esm.mjs",
      ]
    `);

    // esm rsbuild config
    const rsbuildConfigEsm = fileNames.find((item) =>
      item.includes('rsbuild.config.mjs'),
    );
    expect(rsbuildConfigEsm).toBeTruthy();
    expect(files[rsbuildConfigEsm!]).toContain("type: 'modern-module'");

    // esm rspack config
    const rspackConfigEsm = fileNames.find((item) =>
      item.includes('rspack.config.esm.mjs'),
    );
    expect(rspackConfigEsm).toBeTruthy();
    expect(files[rspackConfigEsm!]).toContain("type: 'modern-module'");
  });

  test('--lib multiple', async () => {
    await fse.remove(path.join(__dirname, 'dist'));
    runCliSync('inspect --lib esm --lib cjs', {
      cwd: __dirname,
    });

    const files = await globContentJSON(path.join(__dirname, 'dist/.rsbuild'));
    const fileNames = Object.keys(files).sort();

    // Rsbuild will emit dump files to `dist/esm` if only one environment is specified.
    expect(fileNames).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/cli/inspect/dist/.rsbuild/rsbuild.config.cjs.mjs",
        "<ROOT>/tests/integration/cli/inspect/dist/.rsbuild/rsbuild.config.esm.mjs",
        "<ROOT>/tests/integration/cli/inspect/dist/.rsbuild/rspack.config.cjs.mjs",
        "<ROOT>/tests/integration/cli/inspect/dist/.rsbuild/rspack.config.esm.mjs",
      ]
    `);
  });
});
