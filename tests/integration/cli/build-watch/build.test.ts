import { exec } from 'node:child_process';
import path from 'node:path';
import fse from 'fs-extra';
import { awaitFileExists } from 'test-helper';
import { describe, test } from 'vitest';

describe('build --watch command', async () => {
  test('basic', async () => {
    const distPath = path.join(__dirname, 'dist');
    fse.removeSync(distPath);

    const tempConfigFile = path.join(__dirname, 'test-temp-rslib.config.mjs');

    fse.outputFileSync(
      tempConfigFile,
      `import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig()],
});
  `,
    );

    const process = exec(`npx rslib build --watch -c ${tempConfigFile}`, {
      cwd: __dirname,
    });

    const distEsmIndexFile = path.join(__dirname, 'dist/esm/index.js');

    await awaitFileExists(distEsmIndexFile);

    fse.removeSync(distPath);

    fse.outputFileSync(
      tempConfigFile,
      `import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig()],
});
  `,
    );

    await awaitFileExists(distEsmIndexFile);

    process.kill();
  });
});
