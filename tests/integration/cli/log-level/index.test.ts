import { describe } from 'node:test';
import { stripVTControlCharacters as stripAnsi } from 'node:util';
import { expect, test } from '@rstest/core';
import { runCliSync } from 'test-helper';

describe('log level', async () => {
  test('should run build command with log level: info', async () => {
    const stdout = stripAnsi(
      runCliSync('build --log-level info', {
        cwd: __dirname,
      }).toString(),
    );
    expect(stdout).toContain('Rslib v');
    expect(stdout).toContain('build started...');
    expect(stdout).toContain('built in');
  });

  test('should run build command with log level: warn', async () => {
    const stdout = stripAnsi(
      runCliSync('build --log-level warn', {
        cwd: __dirname,
      }).toString(),
    );
    expect(stdout).not.toContain('Rslib v');
    expect(stdout).not.toContain('build started...');
    expect(stdout).not.toContain('built in');
  });

  test('should always print verbose logs when debug mode is enabled', async () => {
    const stdout = stripAnsi(
      runCliSync('build --log-level warn', {
        cwd: __dirname,
        env: {
          ...process.env,
          DEBUG: 'rsbuild',
        },
      }).toString(),
    );
    expect(stdout).toContain('creating compiler');
    expect(stdout).toContain('config inspection completed');
  });
});
