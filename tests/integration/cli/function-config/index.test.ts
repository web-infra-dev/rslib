import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import fse from 'fs-extra';
import { globContentJSON, runCliSync } from 'test-helper';

test('should parse build command after global option values', async () => {
  await fse.remove(join(__dirname, 'dist'));

  runCliSync('--env-mode inspect build', {
    cwd: __dirname,
  });

  const files = await globContentJSON(join(__dirname, 'dist'));
  expect(Object.keys(files).sort()).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/cli/function-config/dist/production-inspect-build/index.js",
    ]
  `);
});
