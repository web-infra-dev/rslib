import { exec } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import fse from 'fs-extra';
import { awaitFileExists, buildAndGetResults } from 'test-helper';
import { describe, expect, test } from 'vitest';

describe('server config', async () => {
  test('basic config', async () => {
    const fixturePath = join(__dirname, 'basic');
    await buildAndGetResults({ fixturePath });

    // Check if logo.svg in public is copied to dist/esm
    const logoPath = join(__dirname, 'dist', 'esm', 'logo.svg');
    const logoExists = existsSync(logoPath);
    expect(logoExists).toBe(false);
  });

  test('mf dev command', async () => {
    const fixturePath = join(__dirname, 'mf-dev');
    const distPath = join(fixturePath, 'dist');
    const rsbuildConfigFile = join(distPath, '.rsbuild/rsbuild.config.mjs');
    fse.removeSync(distPath);

    const childProcess = exec('npx rslib mf dev', {
      cwd: fixturePath,
      env: {
        ...process.env,
        DEBUG: 'rsbuild',
      },
    });

    await awaitFileExists(rsbuildConfigFile);
    childProcess.kill();

    // Check if the server config is merged correctly
    const rsbuildConfig = await import(rsbuildConfigFile);
    expect(rsbuildConfig.default.server).toMatchInlineSnapshot(`
      {
        "base": "/",
        "compress": true,
        "host": "0.0.0.0",
        "htmlFallback": "index",
        "open": true,
        "port": 3002,
        "printUrls": false,
        "strictPort": false,
      }
    `);
  });
});
