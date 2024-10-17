import { execSync } from 'node:child_process';
import path from 'node:path';
import fse from 'fs-extra';
import { globContentJSON } from 'test-helper';
import { expect, test } from 'vitest';

test.todo('build command', async () => {});

test('inspect command', async () => {
  await fse.remove(path.join(__dirname, 'dist'));
  execSync('pnpm run inspect', {
    cwd: __dirname,
  });

  const files = await globContentJSON(path.join(__dirname, 'dist'));
  const fileNames = Object.keys(files);

  const rsbuildConfig = fileNames.find((item) =>
    item.includes('rsbuild.config.mjs'),
  );

  expect(rsbuildConfig).toBeTruthy();
  expect(files[rsbuildConfig!]).toContain("type: 'modern-module'");

  const rspackConfig = fileNames.find((item) =>
    item.includes('rspack.config.esm.mjs'),
  );
  expect(rspackConfig).toBeTruthy();
  expect(files[rspackConfig!]).toContain("type: 'modern-module'");
});
