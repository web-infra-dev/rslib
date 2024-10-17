import { buildAndGetResults } from 'test-helper';
import { expect, test } from 'vitest';

test('read UMD value in CommonJS', async () => {
  const fixturePath = __dirname;
  const { entryFiles } = await buildAndGetResults({
    fixturePath,
  });

  const fn = require(entryFiles.umd);
  expect(fn('ok')).toBe('DEBUG:ok');
});

test('throw error when using UMD with `bundle: false`', async () => {
  const fixturePath = __dirname;
  const build = buildAndGetResults({
    fixturePath,
    configPath: './rslibBundleFalse.config.ts',
  });

  expect(build).rejects.toThrowErrorMatchingInlineSnapshot(
    `[Error: When using "umd" format, "bundle" must be set to "true". Since the default value for "bundle" is "true", so you can either explicitly set it to "true" or remove the field entirely.]`,
  );
});
