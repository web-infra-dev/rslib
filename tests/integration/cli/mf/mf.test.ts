import { exec, execSync } from 'node:child_process';
import { join } from 'node:path';
import { describe } from 'node:test';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { startMFDevServer } from '@rslib/core';
import { expect, test } from '@rstest/core';
import fse from 'fs-extra';
import { awaitFileExists } from 'test-helper';

const { existsSync } = fse;

describe('mf-dev', () => {
  test('mf-dev --lib', async () => {
    const fixturePath = join(__dirname, 'dev');
    const distFolder = join(fixturePath, 'dist-mf0');
    const rsbuildConfigFile = join(distFolder, '.rsbuild/rsbuild.config.mjs');
    const rspackConfigFile = join(distFolder, '.rsbuild/rspack.config.mf0.mjs');

    fse.removeSync(distFolder);
    const distPath = join(distFolder, 'index.js');

    const childProcess = exec('npx rslib mf-dev --lib mf0', {
      cwd: fixturePath,
      env: {
        ...process.env,
        DEBUG: 'rsbuild',
      },
    });

    await awaitFileExists(distPath);

    const rspackConfigContent = await fse.readFile(rspackConfigFile, 'utf-8');
    expect(rspackConfigContent).toContain(`nodeEnv: 'development'`);
    expect(rspackConfigContent).toContain(`moduleIds: 'named'`);

    const rsbuildConfigContent = await fse.readFile(rsbuildConfigFile, 'utf-8');
    expect(rsbuildConfigContent).toContain('writeToDisk: true');
    expect(existsSync(distPath)).toBe(true);

    childProcess.kill();
  });

  test('mf-dev --lib multiple', async () => {
    const fixturePath = join(__dirname, 'dev');
    const distFolder1 = join(fixturePath, 'dist-mf1');
    const distFolder2 = join(fixturePath, 'dist-mf2');
    fse.removeSync(distFolder1);
    fse.removeSync(distFolder2);
    const distPath1 = join(distFolder1, 'index.js');
    const distPath2 = join(distFolder2, 'index.js');

    const childProcess = exec('npx rslib mf-dev --lib mf1 --lib mf2', {
      cwd: fixturePath,
    });

    await awaitFileExists(distPath1);
    await awaitFileExists(distPath2);

    expect(existsSync(distPath1)).toBe(true);
    expect(existsSync(distPath2)).toBe(true);

    childProcess.kill();
  });

  test('mf-dev --lib should error when lib not found', async () => {
    try {
      await startMFDevServer(
        {
          lib: [
            {
              format: 'mf',
              plugins: [pluginModuleFederation({ name: 'test-not-exist' }, {})],
            },
          ],
        },
        {
          lib: ['not-exist'],
        },
      );
    } catch (error) {
      expect((error as Error).message).toMatchInlineSnapshot(
        `"No mf format found in libs "not-exist", please check your config to ensure that the mf format is enabled correctly."`,
      );
    }
  });

  test('mf-dev should error when no mf format', async () => {
    try {
      await startMFDevServer({
        lib: [
          {
            format: 'esm',
          },
        ],
      });
    } catch (error) {
      expect((error as Error).message).toMatchInlineSnapshot(
        `"No mf format found in your config, please check your config to ensure that the mf format is enabled correctly."`,
      );
    }
  });
});

describe('mf build', () => {
  test('should compose config correctly', async () => {
    const fixturePath = join(__dirname, 'build');
    const distPath = join(fixturePath, 'dist/mf');
    const rspackConfigFile = join(distPath, '.rsbuild/rspack.config.mf.mjs');

    execSync('npx rslib build', {
      cwd: fixturePath,
      env: {
        ...process.env,
        DEBUG: 'rsbuild',
      },
    });

    const rspackConfigContent = await fse.readFile(rspackConfigFile, 'utf-8');

    expect(rspackConfigContent).toContain(`nodeEnv: 'production'`);
    expect(rspackConfigContent).toContain(`moduleIds: 'deterministic'`);
  });
});
