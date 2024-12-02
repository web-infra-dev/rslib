import { exec } from 'node:child_process';
import path from 'node:path';
import fse from 'fs-extra';
import { awaitFileExists } from 'test-helper';
import { describe, test } from 'vitest';

describe('build --watch command', async () => {
  test('basic', async () => {
    const distPath = path.join(__dirname, 'dist');
    const dist1Path = path.join(__dirname, 'dist-1');
    fse.removeSync(distPath);

    fse.removeSync(dist1Path);

    const distEsmIndexFile = path.join(__dirname, 'dist/esm/index.js');
    const dist1EsmIndexFile = path.join(__dirname, 'dist-1/esm/index.js');

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

    await awaitFileExists(distEsmIndexFile);

    fse.outputFileSync(
      tempConfigFile,
      `import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig({
   output: {
      distPath: {
        root: './dist-1/esm',
      },
    },
  })],
});
  `,
    );

    await awaitFileExists(dist1EsmIndexFile);

    process.kill();
  });
});
