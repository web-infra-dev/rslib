import path from 'node:path';
import { describe, expect, test } from '@rstest/core';
import fse from 'fs-extra';
import { buildAndGetResults, globContentJSON, runCliSync } from 'test-helper';

describe('build command', async () => {
  test('basic', async () => {
    await fse.remove(path.join(__dirname, 'dist'));
    runCliSync('build', {
      cwd: __dirname,
    });

    const files = await globContentJSON(path.join(__dirname, 'dist'));
    const fileNames = Object.keys(files).sort();
    expect(fileNames).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/cli/build/dist/cjs/index.cjs",
        "<ROOT>/tests/integration/cli/build/dist/esm/index.js",
      ]
    `);
  });

  test('--lib', async () => {
    await fse.remove(path.join(__dirname, 'dist'));
    runCliSync('build --lib esm', {
      cwd: __dirname,
    });

    const files = await globContentJSON(path.join(__dirname, 'dist'));
    const fileNames = Object.keys(files).sort();
    expect(fileNames).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/cli/build/dist/esm/index.js",
      ]
    `);
  });

  test('--lib multiple', async () => {
    await fse.remove(path.join(__dirname, 'dist'));
    runCliSync('build --lib esm --lib cjs', {
      cwd: __dirname,
    });

    const files = await globContentJSON(path.join(__dirname, 'dist'));
    const fileNames = Object.keys(files).sort();
    expect(fileNames).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/cli/build/dist/cjs/index.cjs",
        "<ROOT>/tests/integration/cli/build/dist/esm/index.js",
      ]
    `);
  });

  test('--lib should throw error if not found', async () => {
    await fse.remove(path.join(__dirname, 'dist'));
    try {
      await buildAndGetResults({
        fixturePath: __dirname,
        lib: ['not-exist'],
      });
    } catch (error) {
      expect((error as Error).message).toMatchInlineSnapshot(
        `"The following libs are not found: "not-exist"."`,
      );
    }
    expect(fse.existsSync(path.join(__dirname, 'dist'))).toBe(false);
  });

  test('--config', async () => {
    await fse.remove(path.join(__dirname, 'dist'));
    runCliSync('build --config ./custom-config/rslib.config.custom.ts', {
      cwd: __dirname,
    });

    const files = await globContentJSON(path.join(__dirname, 'dist'));
    const fileNames = Object.keys(files).sort();
    expect(fileNames).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/cli/build/dist/custom/index.cjs",
        "<ROOT>/tests/integration/cli/build/dist/custom/index.js",
      ]
    `);
  });

  test('should use Node.js native loader to load config', async () => {
    // Skip Node.js <= 22.18
    if (!process.features.typescript) {
      return;
    }

    await fse.remove(path.join(__dirname, 'dist'));
    runCliSync('build --config-loader native', {
      cwd: __dirname,
    });

    const files = await globContentJSON(path.join(__dirname, 'dist'));
    const fileNames = Object.keys(files).sort();
    expect(fileNames).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/cli/build/dist/cjs/index.cjs",
        "<ROOT>/tests/integration/cli/build/dist/esm/index.js",
      ]
    `);
  });

  test('should fallback to jiti when --config-loader set to auto which is default strategy', async () => {
    await fse.remove(path.join(__dirname, 'dist-auto'));
    runCliSync('build --config rslib.config.auto.mts', {
      cwd: __dirname,
    });

    const files = await globContentJSON(path.join(__dirname, 'dist-auto'));
    const fileNames = Object.keys(files).sort();
    expect(fileNames).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/cli/build/dist-auto/index.js",
      ]
    `);
  });

  test('--root', async () => {
    await fse.remove(path.join(__dirname, 'dist'));
    runCliSync('build --root custom-root', {
      cwd: __dirname,
    });

    const files = await globContentJSON(
      path.join(__dirname, 'custom-root/dist'),
    );
    const fileNames = Object.keys(files).sort();
    expect(fileNames).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/cli/build/custom-root/dist/root/index.cjs",
        "<ROOT>/tests/integration/cli/build/custom-root/dist/root/index.js",
      ]
    `);
  });
});
