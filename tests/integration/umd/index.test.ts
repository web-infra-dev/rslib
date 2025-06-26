import { expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';

test('read UMD value in CommonJS', async () => {
  process.env.NODE_ENV = 'production';
  const fixturePath = __dirname;
  const { entryFiles } = await buildAndGetResults({
    fixturePath,
  });

  const fn = require(entryFiles.umd);
  expect(fn('ok')).toBe('production: DEBUG:ok');
  delete process.env.NODE_ENV;
});

test('throw error when using UMD with `bundle: false`', async () => {
  const fixturePath = __dirname;
  const build = buildAndGetResults({
    fixturePath,
    configPath: './rslibBundleFalse.config.ts',
  });

  await expect(build).rejects.toThrowErrorMatchingInlineSnapshot(
    `[Error: When using "umd" format, "bundle" must be set to "true". Since the default value for "bundle" is "true", so you can either explicitly set it to "true" or remove the field entirely.]`,
  );
});
