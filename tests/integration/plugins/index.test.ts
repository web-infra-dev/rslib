import { exec } from 'node:child_process';
import fs from 'node:fs';
import { join } from 'node:path';
import { awaitFileExists, buildAndGetResults } from 'test-helper';
import { expect, test } from 'vitest';
import { distIndex } from './basic/rslib.config';
import { plugin1Path, plugin2Path } from './mf-dev/rslib.config';

test('should run shared plugins only once', async () => {
  const fixturePath = join(__dirname, 'basic');
  await buildAndGetResults({ fixturePath });

  const content = fs.readFileSync(distIndex, 'utf-8');
  expect(content).toEqual('count: 1');
});

test('should merge plugins correctly', async () => {
  const fixturePath = join(__dirname, 'mf-dev');
  const childProcess = exec('npx rslib mf-dev', {
    cwd: fixturePath,
  });

  await awaitFileExists(plugin1Path);
  await awaitFileExists(plugin2Path);

  const content1 = fs.readFileSync(plugin1Path, 'utf-8');
  const content2 = fs.readFileSync(plugin2Path, 'utf-8');
  expect(content1).toEqual('plugin1 count: 1');
  expect(content2).toEqual('plugin2');

  childProcess.kill();
});
