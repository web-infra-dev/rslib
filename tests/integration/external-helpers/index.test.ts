import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import stripAnsi from 'strip-ansi';
import { buildAndGetResults, proxyConsole } from 'test-helper';

test('should not external @swc/helpers by default', async () => {
  const fixturePath = join(__dirname, 'default');
  const { entries } = await buildAndGetResults({ fixturePath });

  expect(entries.esm).toMatchSnapshot();
});

test('should throw error when @swc/helpers is not be installed when externalHelpers is true', async () => {
  const { logs, restore } = proxyConsole();

  const fixturePath = join(__dirname, 'no-deps');
  try {
    await buildAndGetResults({ fixturePath });
  } catch {}

  const logStrings = logs.map((log) => stripAnsi(log));

  expect(logStrings).toMatchInlineSnapshot(`
    [
      "error   externalHelpers is enabled, but the @swc/helpers dependency declaration was not found in package.json.",
    ]
  `);

  restore();
});

test('should external @swc/helpers when externalHelpers is true', async () => {
  const fixturePath = join(__dirname, 'true');
  const { entries } = await buildAndGetResults({ fixturePath });

  // autoExternal is true
  expect(entries.esm0).toMatchSnapshot();
  // autoExternal is false
  expect(entries.esm1).toMatchSnapshot();
});

test('should respect user override externalHelpers config', async () => {
  const fixturePath = join(__dirname, 'config-override');
  const { entries } = await buildAndGetResults({ fixturePath });

  // override externalHelpers false
  expect(entries.esm0).toMatchSnapshot();
  // override externalHelpers true
  expect(entries.esm1).toMatchSnapshot();
});
