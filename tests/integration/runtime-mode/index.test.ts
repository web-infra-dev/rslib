import { beforeAll, expect, test } from '@rstest/core';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildAndGetResults } from 'test-helper';

beforeAll(async () => {
  await buildAndGetResults({ fixturePath: __dirname });
});

test('executes shared CJS dependencies with the default export helper', async () => {
  const runtime = await import(
    pathToFileURL(join(__dirname, 'dist/esm/runtime.mjs')).href
  );
  const a = await import(pathToFileURL(join(__dirname, 'dist/esm/a.mjs')).href);
  const b = await import(pathToFileURL(join(__dirname, 'dist/esm/b.mjs')).href);

  expect(typeof runtime.compatGetDefaultExport).toBe('function');
  expect(a.value).toBe('42:a');
  expect(b.value).toBe('42:b');
});

test('executes shared CJS dependencies after bundling again', async () => {
  await buildAndGetResults({
    fixturePath: __dirname,
    configPath: 'rslibConsumer.config.ts',
  });

  const a = await import(
    pathToFileURL(join(__dirname, 'dist/consumer/a.mjs')).href
  );
  const b = await import(
    pathToFileURL(join(__dirname, 'dist/consumer/b.mjs')).href
  );

  expect(a.value).toBe('42:a');
  expect(b.value).toBe('42:b');
});
