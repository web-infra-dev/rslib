import { execSync } from 'node:child_process';
import path from 'node:path';
import fse from 'fs-extra';
import { globContentJSON } from 'test-helper';
import { describe, expect, test } from 'vitest';

describe('build command', async () => {
  test('basic', async () => {
    await fse.remove(path.join(__dirname, 'dist'));
    execSync('npx rslib build', {
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
    execSync('npx rslib build --lib esm', {
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
    execSync('npx rslib build --lib esm --lib cjs', {
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

  test('--config', async () => {
    await fse.remove(path.join(__dirname, 'dist'));
    execSync(
      'npx rslib build --config ./custom-config/rslib.config.custom.ts',
      {
        cwd: __dirname,
      },
    );

    const files = await globContentJSON(path.join(__dirname, 'dist'));
    const fileNames = Object.keys(files).sort();
    expect(fileNames).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/cli/build/dist/custom/index.cjs",
        "<ROOT>/tests/integration/cli/build/dist/custom/index.js",
      ]
    `);
  });

  test('--root', async () => {
    await fse.remove(path.join(__dirname, 'dist'));
    execSync('npx rslib build --root custom-root', {
      cwd: __dirname,
    });

    const files = await globContentJSON(path.join(__dirname, 'dist'));
    const fileNames = Object.keys(files).sort();
    expect(fileNames).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/cli/build/dist/root/index.cjs",
        "<ROOT>/tests/integration/cli/build/dist/root/index.js",
      ]
    `);
  });
});