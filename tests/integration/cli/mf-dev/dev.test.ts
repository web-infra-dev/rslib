import { exec } from 'node:child_process';
import { join } from 'node:path';
import { describe } from 'node:test';
import fse, { existsSync } from 'fs-extra';
import { awaitFileExists } from 'test-helper';
import { expect, test } from 'vitest';

const distFolder = join(__dirname, 'dist');

describe('mf-dev', () => {
  test('mf-dev --lib', async () => {
    const fixturePath = join(__dirname);
    fse.removeSync(distFolder);
    const distPath = join(distFolder, 'mf0', 'index.js');

    const childProcess = exec('npx rslib mf-dev --lib mf0', {
      cwd: fixturePath,
    });

    await awaitFileExists(distPath);

    expect(existsSync(distPath)).toBe(true);
    childProcess.kill();
  });

  test('mf-dev --lib multiple', async () => {
    const fixturePath = join(__dirname);
    fse.removeSync(distFolder);
    const distPath1 = join(distFolder, 'mf1', 'index.js');
    const distPath2 = join(distFolder, 'mf2', 'index.js');

    const childProcess = exec('npx rslib mf-dev --lib mf1 --lib mf2', {
      cwd: fixturePath,
    });

    await awaitFileExists(distPath1);
    await awaitFileExists(distPath2);

    expect(existsSync(distPath1)).toBe(true);
    expect(existsSync(distPath2)).toBe(true);

    childProcess.kill();
  });
});
