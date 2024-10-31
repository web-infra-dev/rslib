import { execSync } from 'node:child_process';
import path from 'node:path';
import fse from 'fs-extra';
import { globContentJSON } from 'test-helper';
import { expect, test } from 'vitest';

test.todo('build command', async () => {});

test('inspect command', async () => {
  await fse.remove(path.join(__dirname, 'dist'));
  execSync('npx rslib inspect', {
    cwd: __dirname,
  });

  const files = await globContentJSON(path.join(__dirname, 'dist/.rsbuild'));
  const fileNames = Object.keys(files).sort();

  expect(fileNames).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/cli/dist/.rsbuild/rsbuild.config.cjs.mjs",
      "<ROOT>/tests/integration/cli/dist/.rsbuild/rsbuild.config.esm.mjs",
      "<ROOT>/tests/integration/cli/dist/.rsbuild/rspack.config.cjs.mjs",
      "<ROOT>/tests/integration/cli/dist/.rsbuild/rspack.config.esm.mjs",
    ]
  `);

  // esm rsbuild config
  const rsbuildConfigEsm = fileNames.find((item) =>
    item.includes('rsbuild.config.esm.mjs'),
  );
  expect(rsbuildConfigEsm).toBeTruthy();
  expect(files[rsbuildConfigEsm!]).toContain("type: 'modern-module'");

  // esm rspack config
  const rspackConfigEsm = fileNames.find((item) =>
    item.includes('rspack.config.esm.mjs'),
  );
  expect(rspackConfigEsm).toBeTruthy();
  expect(files[rspackConfigEsm!]).toContain("type: 'modern-module'");
});
