import path from 'node:path';
import { stripVTControlCharacters as stripAnsi } from 'node:util';
import { describe, expect, test } from '@rstest/core';
import fse from 'fs-extra';
import {
  buildAndGetResults,
  extractRslibConfig,
  globContentJSON,
  runCliSync,
} from 'test-helper';

describe('build command', async () => {
  test('basic', async () => {
    await fse.remove(path.join(__dirname, 'dist'));
    runCliSync('build', {
      cwd: __dirname,
    });

    const files = await globContentJSON(path.join(__dirname, 'dist'));
    const fileNames = Object.keys(files).sort();
    expect(fileNames).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/cli/build/dist/cjs/index.cjs",
        "<ROOT>/tests/integration/cli/build/dist/esm/index.js",
      ]
    `);
  });

  test('--lib', async () => {
    await fse.remove(path.join(__dirname, 'dist'));
    runCliSync('build --lib esm', {
      cwd: __dirname,
    });

    const files = await globContentJSON(path.join(__dirname, 'dist'));
    const fileNames = Object.keys(files).sort();
    expect(fileNames).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/cli/build/dist/esm/index.js",
      ]
    `);
  });

  test('--lib multiple', async () => {
    await fse.remove(path.join(__dirname, 'dist'));
    runCliSync('build --lib esm --lib cjs', {
      cwd: __dirname,
    });

    const files = await globContentJSON(path.join(__dirname, 'dist'));
    const fileNames = Object.keys(files).sort();
    expect(fileNames).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/cli/build/dist/cjs/index.cjs",
        "<ROOT>/tests/integration/cli/build/dist/esm/index.js",
      ]
    `);
  });

  test('--lib should throw error if not found', async () => {
    await fse.remove(path.join(__dirname, 'dist'));
    try {
      await buildAndGetResults({
        fixturePath: __dirname,
        lib: ['not-exist'],
      });
    } catch (error) {
      expect((error as Error).message).toMatchInlineSnapshot(
        `"The following libs are not found: "not-exist"."`,
      );
    }
    expect(fse.existsSync(path.join(__dirname, 'dist'))).toBe(false);
  });

  test('--config', async () => {
    await fse.remove(path.join(__dirname, 'dist'));
    runCliSync('build --config ./custom-config/rslib.config.custom.ts', {
      cwd: __dirname,
    });

    const files = await globContentJSON(path.join(__dirname, 'dist'));
    const fileNames = Object.keys(files).sort();
    expect(fileNames).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/cli/build/dist/custom/index.cjs",
        "<ROOT>/tests/integration/cli/build/dist/custom/index.js",
      ]
    `);
  });

  test('should use Node.js native loader to load config', async () => {
    // Skip Node.js <= 22.18
    if (!process.features.typescript) {
      return;
    }

    await fse.remove(path.join(__dirname, 'dist'));
    runCliSync('build --config-loader native', {
      cwd: __dirname,
    });

    const files = await globContentJSON(path.join(__dirname, 'dist'));
    const fileNames = Object.keys(files).sort();
    expect(fileNames).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/cli/build/dist/cjs/index.cjs",
        "<ROOT>/tests/integration/cli/build/dist/esm/index.js",
      ]
    `);
  });

  test('should fallback to jiti when --config-loader set to auto which is default strategy', async () => {
    await fse.remove(path.join(__dirname, 'dist-auto'));
    runCliSync('build --config rslib.config.auto.mts', {
      cwd: __dirname,
    });

    const files = await globContentJSON(path.join(__dirname, 'dist-auto'));
    const fileNames = Object.keys(files).sort();
    expect(fileNames).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/cli/build/dist-auto/index.js",
      ]
    `);
  });

  test('--root', async () => {
    await fse.remove(path.join(__dirname, 'dist'));
    runCliSync('build --root custom-root', {
      cwd: __dirname,
    });

    const files = await globContentJSON(
      path.join(__dirname, 'custom-root/dist'),
    );
    const fileNames = Object.keys(files).sort();
    expect(fileNames).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/cli/build/custom-root/dist/root/index.cjs",
        "<ROOT>/tests/integration/cli/build/custom-root/dist/root/index.js",
      ]
    `);
  });

  test('should throw error if config file is absent, but it should work if the future', async () => {
    const fixturePath = path.join(__dirname, 'no-config');
    await fse.remove(path.join(fixturePath, 'dist'));

    expect(() =>
      runCliSync('build --format cjs', {
        cwd: fixturePath,
      }),
    ).toThrowError(/rslib\.config not found in.*cli[\\/]build[\\/]no-config/);
  });

  test('build options', async () => {
    const fixturePath = path.join(__dirname, 'options');
    await fse.remove(path.join(fixturePath, 'dist/ok'));

    const command = [
      'build',
      '--entry="./src/*"',
      '--dist-path=dist/ok',
      '--no-bundle',
      '--format=esm',
      '--syntax="node 14" --syntax="Chrome 103"',
      '--target=web',
      '--dts=true',
      '--externals=./bar',
      '--minify=false',
      '--auto-extension=false',
    ].join(' ');

    const stdout = runCliSync(command, {
      cwd: fixturePath,
      env: {
        ...process.env,
        DEBUG: 'rslib',
      },
    });

    const rslibConfigText = stripAnsi(extractRslibConfig(stdout));
    expect(rslibConfigText).toMatchInlineSnapshot(`
      "{
        lib: [
          {
            bundle: false,
            source: { entry: { '*': './src/*' } },
            format: 'esm',
            output: {
              distPath: { root: 'dist/ok' },
              target: 'web',
              minify: false,
              externals: [ './bar' ]
            },
            syntax: [ 'node 14', 'Chrome 103' ],
            dts: true,
            autoExtension: 'false'
          }
        ],
        _privateMeta: {
          configFilePath: '<ROOT>/tests/integration/cli/build/options/rslib.config.ts'
        },
        source: { define: {} }
      }"
    `);

    const files = await globContentJSON(path.join(fixturePath, 'dist/ok'));
    const fileNames = Object.keys(files).sort();
    expect(fileNames).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/cli/build/options/dist/ok/foo.d.ts",
        "<ROOT>/tests/integration/cli/build/options/dist/ok/foo.js",
      ]
    `);
    const output = files[fileNames[1]!];
    expect(output).toMatch(/export { .* }/);
  });
});
