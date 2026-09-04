import { createRslib } from '@rslib/core';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, describe, expect, onTestFinished, test } from '@rstest/core';
import { buildAndGetResults, expectBuildToFail } from 'test-helper';

const fixtures = [
  'dual-format',
  'esm-only',
  'multiple-entries',
  'umd',
  'build-error',
];

// The "exports" field is written back to the fixture package.json after
// building, keep a backup and restore it once the tests are done.
const packageJsonContents = new Map(
  fixtures.map((fixture) => [
    fixture,
    readFileSync(join(__dirname, fixture, 'package.json'), 'utf8'),
  ]),
);

afterAll(() => {
  for (const [fixture, content] of packageJsonContents) {
    writeFileSync(join(__dirname, fixture, 'package.json'), content);
  }
});

const readFixtureExports = (fixture: string) =>
  JSON.parse(readFileSync(join(__dirname, fixture, 'package.json'), 'utf8'))
    .exports;

describe('output.exports', () => {
  test('should generate import and require conditions when building esm and cjs formats', async () => {
    const fixturePath = join(__dirname, 'dual-format');
    await buildAndGetResults({ fixturePath });

    expect(readFixtureExports('dual-format')).toEqual({
      './package.json': './package.json',
      '.': {
        import: './dist/esm/index.mjs',
        require: './dist/cjs/index.js',
      },
    });
  });

  test('should generate a string value when building a single format', async () => {
    const fixturePath = join(__dirname, 'esm-only');
    await buildAndGetResults({ fixturePath });

    expect(readFixtureExports('esm-only')).toEqual({
      './package.json': './package.json',
      '.': './dist/esm/index.mjs',
    });
  });

  test('should not write exports in watch mode', async () => {
    const fixture = 'esm-only';
    const fixturePath = join(__dirname, fixture);
    const packageJsonPath = join(fixturePath, 'package.json');
    const originalPackageJson = packageJsonContents.get(fixture)!;
    writeFileSync(packageJsonPath, originalPackageJson);

    const rslib = await createRslib({
      cwd: fixturePath,
      config: {
        lib: [{ format: 'esm' }],
        output: {
          exports: true,
        },
        logLevel: 'silent',
      },
    });
    const buildDone = new Promise<void>((resolve) => {
      rslib.onAfterCreateRsbuild(({ rsbuild }) => {
        rsbuild.onAfterBuild({
          order: 'post',
          handler: () => resolve(),
        });
      });
    });
    const buildResult = await rslib.build({ watch: true });
    onTestFinished(() => buildResult.close());

    await buildDone;
    expect(readFileSync(packageJsonPath, 'utf8')).toBe(originalPackageJson);
  });

  test('should expose each bundleless entry as a subpath', async () => {
    const fixturePath = join(__dirname, 'multiple-entries');
    await buildAndGetResults({ fixturePath });

    expect(readFixtureExports('multiple-entries')).toEqual({
      './package.json': './package.json',
      '.': './dist/esm/index.mjs',
      './utils/numbers': './dist/esm/utils/numbers.mjs',
    });
  });

  test('should not generate exports when building the umd format', async () => {
    const fixturePath = join(__dirname, 'umd');
    await buildAndGetResults({ fixturePath });

    expect(readFixtureExports('umd')).toBeUndefined();
  });

  test('should not generate exports when the build fails', async () => {
    const fixturePath = join(__dirname, 'build-error');
    await expectBuildToFail(buildAndGetResults({ fixturePath }));

    expect(readFixtureExports('build-error')).toBeUndefined();
  });
});
