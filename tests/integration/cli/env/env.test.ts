import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, test } from '@rstest/core';
import { runCliSync } from 'test-helper';

const localFile = path.join(__dirname, '.env.local');
const prodLocalFile = path.join(__dirname, '.env.production.local');

describe('load env file', async () => {
  beforeEach(() => {
    fs.rmSync(localFile, { force: true });
    fs.rmSync(prodLocalFile, { force: true });
  });

  test('should load .env config and allow rslib.config.ts to read env vars', async () => {
    runCliSync('build', {
      cwd: __dirname,
    });

    expect(fs.existsSync(path.join(__dirname, 'dist/1'))).toBeTruthy();
  });

  test('should load .env.local with higher priority', async () => {
    fs.writeFileSync(localFile, 'FOO=2');

    runCliSync('build', {
      cwd: __dirname,
    });

    expect(fs.existsSync(path.join(__dirname, 'dist/2'))).toBeTruthy();
  });

  test('should load .env.production.local with higher priority', async () => {
    fs.writeFileSync(localFile, 'FOO=2');
    fs.writeFileSync(prodLocalFile, 'FOO=3');

    runCliSync('build', {
      cwd: __dirname,
    });

    expect(fs.existsSync(path.join(__dirname, 'dist/3'))).toBeTruthy();
  });

  test('should allow to specify env mode via --env-mode', async () => {
    runCliSync('build --env-mode test', {
      cwd: __dirname,
    });

    expect(fs.existsSync(path.join(__dirname, 'dist/5'))).toBeTruthy();
  });

  test('should allow to custom env directory via --env-dir', async () => {
    runCliSync('build --env-dir env', {
      cwd: __dirname,
    });

    expect(fs.existsSync(path.join(__dirname, 'dist/7'))).toBeTruthy();
  });
});
