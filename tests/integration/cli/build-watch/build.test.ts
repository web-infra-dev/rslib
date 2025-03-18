import { exec, spawn } from 'node:child_process';
import path from 'node:path';
import { after } from 'node:test';
import fse from 'fs-extra';
import { awaitFileChanges, awaitFileExists } from 'test-helper';
import { describe, expect, test } from 'vitest';

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

describe('build --watch should handle add / change / unlink', async () => {
  test('basic', async () => {
    const tempSrcPath = path.join(__dirname, 'test-temp-src');
    const tempConfigFile = path.join(__dirname, 'test-temp-rslib.config.mjs');
    await fse.remove(tempSrcPath);
    await fse.remove(path.join(__dirname, 'dist'));
    await fse.remove(tempConfigFile);

    await fse.copy(path.join(__dirname, 'src'), path.resolve(tempSrcPath));
    fse.outputFileSync(
      tempConfigFile,
      `import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig, generateBundleCjsConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
    }),
    generateBundleCjsConfig({
      bundle: false,
    }),
  ],
  source: {
    entry: {
      index: ['./test-temp-src/**'],
    },
  },
});
`,
    );

    const srcIndexFile = path.join(tempSrcPath, 'index.ts');
    const srcFooFile = path.join(tempSrcPath, 'foo.ts');
    const srcFoo2File = path.join(tempSrcPath, 'foo2.ts');
    const distIndexFile = path.join(__dirname, 'dist/esm/index.js');
    const distFooFile = path.join(__dirname, 'dist/esm/foo.js');
    const distFoo2File = path.join(__dirname, 'dist/esm/foo2.js');

    const child = spawn(
      'npx',
      ['rslib', 'build', '--watch', '-c', tempConfigFile],
      {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true,
      },
    );
    await awaitFileExists(distIndexFile);

    fse.outputFileSync(srcFooFile, `export const foo = 'foo';`);
    fse.outputFileSync(srcFoo2File, `export const foo2 = 'foo2';`);
    await awaitFileExists(distFooFile);
    await awaitFileExists(distFoo2File);
    const content1 = await fse.readFile(distFooFile, 'utf-8');
    expect(content1!).toMatchInlineSnapshot(`
      "const foo = 'foo';
      export { foo };
      "
    `);
    const content2 = await fse.readFile(distFoo2File, 'utf-8');
    expect(content2!).toMatchInlineSnapshot(`
      "const foo2 = 'foo2';
      export { foo2 };
      "
    `);

    // unlink
    // Following "change" cases won't succeed if error is thrown in this step.
    fse.removeSync(srcIndexFile);

    // change
    const wait = await awaitFileChanges(distFooFile, 'foo1');
    fse.outputFileSync(srcFooFile, `export const foo = 'foo1';`);
    await wait();
    const content3 = await fse.readFile(distFooFile, 'utf-8');
    expect(content3!).toMatchInlineSnapshot(`
      "const foo = 'foo1';
      export { foo };
      "
    `);

    after(() => {
      child.kill();
    });
  });
});
