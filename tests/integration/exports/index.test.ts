import { createRslib } from '@rslib/core';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, describe, expect, test } from '@rstest/core';
import {
  buildAndGetResults,
  expectBuildToFail,
  expectPoll,
  rslibBuild,
} from 'test-helper';

const fixtures = [
  'dual-format',
  'esm-only',
  'multiple-entries',
  'bundleless',
  'umd',
  'build-error',
  'dts/matched',
  'dts/shared',
  'dts/dist-path',
  'dts/module',
  'dts/bundleless',
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

describe('exports', () => {
  test('should generate import and require conditions when building esm and cjs formats', async () => {
    const fixturePath = join(__dirname, 'dual-format');
    await buildAndGetResults({ fixturePath, exports: true });

    expect(readFixtureExports('dual-format')).toEqual({
      '.': {
        import: './dist/esm/index.mjs',
        require: './dist/cjs/index.js',
      },
    });
  });

  test('should generate a string value when building a single format', async () => {
    const fixturePath = join(__dirname, 'esm-only');
    await buildAndGetResults({ fixturePath, exports: true });

    expect(readFixtureExports('esm-only')).toEqual({
      '.': './dist/esm/index.mjs',
    });
  });

  test('should generate exports in watch mode', async () => {
    const fixture = 'esm-only';
    const fixturePath = join(__dirname, fixture);
    const packageJsonPath = join(fixturePath, 'package.json');
    writeFileSync(packageJsonPath, packageJsonContents.get(fixture)!);

    const rslib = await createRslib({
      cwd: fixturePath,
      config: {
        lib: [{ format: 'esm', output: { distPath: 'dist/esm' } }],
        source: { entry: { index: '../__fixtures__/src/index.ts' } },
        exports: true,
        logLevel: 'silent',
      },
    });
    const buildResult = await rslib.build({ watch: true });

    try {
      await expectPoll(() =>
        readFileSync(packageJsonPath, 'utf8').includes('"exports"'),
      ).toBeTruthy();
      expect(readFixtureExports(fixture)).toEqual({
        '.': './dist/esm/index.mjs',
      });
    } finally {
      await buildResult.close();
    }
  });

  test('should read the exports option from the config file', async () => {
    const fixture = 'esm-only';
    const fixturePath = join(__dirname, fixture);
    writeFileSync(
      join(fixturePath, 'package.json'),
      packageJsonContents.get(fixture)!,
    );

    await rslibBuild({
      cwd: fixturePath,
      modifyConfig: (config) => {
        config.exports = true;
      },
    });

    expect(readFixtureExports(fixture)).toEqual({
      '.': './dist/esm/index.mjs',
    });
  });

  test('should let the build option override the exports config', async () => {
    const fixture = 'esm-only';
    const fixturePath = join(__dirname, fixture);
    writeFileSync(
      join(fixturePath, 'package.json'),
      packageJsonContents.get(fixture)!,
    );

    await rslibBuild({
      cwd: fixturePath,
      modifyConfig: (config) => {
        config.exports = true;
      },
      exports: false,
    });

    expect(readFixtureExports(fixture)).toBeUndefined();
  });

  test('should keep user conditions of an existing subpath', async () => {
    const fixture = 'dual-format';
    const fixturePath = join(__dirname, fixture);
    writeFileSync(
      join(fixturePath, 'package.json'),
      `${JSON.stringify(
        {
          name: 'exports-dual-format-test',
          exports: {
            '.': {
              '@acme/source': './src/index.ts',
              import: './dist/esm/old.mjs',
              require: './dist/cjs/old.js',
            },
          },
        },
        null,
        2,
      )}\n`,
    );

    await buildAndGetResults({ fixturePath, exports: true });

    const exports = readFixtureExports(fixture);
    expect(Object.keys(exports['.'])).toEqual([
      '@acme/source',
      'import',
      'require',
    ]);
    expect(exports).toEqual({
      '.': {
        '@acme/source': './src/index.ts',
        import: './dist/esm/index.mjs',
        require: './dist/cjs/index.js',
      },
    });
  });

  test('should merge into existing exports and preserve the formatting', async () => {
    const fixture = 'esm-only';
    const fixturePath = join(__dirname, fixture);
    const packageJsonPath = join(fixturePath, 'package.json');
    writeFileSync(
      packageJsonPath,
      [
        '{',
        '\t"name": "exports-esm-only-test",',
        '\t"exports": {',
        '\t\t"./package.json": "./package.json",',
        '\t\t".": "./dist/esm/old.mjs"',
        '\t}',
        '}',
        '',
      ].join('\n'),
    );

    await buildAndGetResults({ fixturePath, exports: true });

    expect(readFileSync(packageJsonPath, 'utf8')).toBe(
      [
        '{',
        '\t"name": "exports-esm-only-test",',
        '\t"exports": {',
        '\t\t"./package.json": "./package.json",',
        '\t\t".": "./dist/esm/index.mjs"',
        '\t}',
        '}',
        '',
      ].join('\n'),
    );
  });

  test('should fail when the existing exports is not a subpath map', async () => {
    const fixture = 'esm-only';
    const fixturePath = join(__dirname, fixture);
    const packageJsonPath = join(fixturePath, 'package.json');
    const packageJson = `${JSON.stringify(
      { name: 'exports-esm-only-test', exports: './index.js' },
      null,
      2,
    )}\n`;
    writeFileSync(packageJsonPath, packageJson);

    const error = await expectBuildToFail(
      buildAndGetResults({ fixturePath, exports: true }),
    );

    expect(error.message).toContain('is not a subpath map');
    expect(readFileSync(packageJsonPath, 'utf8')).toBe(packageJson);
  });

  test('should expose each entry as a subpath', async () => {
    const fixturePath = join(__dirname, 'multiple-entries');
    await buildAndGetResults({ fixturePath, exports: true });

    expect(readFixtureExports('multiple-entries')).toEqual({
      '.': './dist/esm/index.mjs',
      './utils/numbers': './dist/esm/utils/numbers.mjs',
    });
  });

  test('should only expose the main entry in bundleless mode', async () => {
    const fixturePath = join(__dirname, 'bundleless');
    await buildAndGetResults({ fixturePath, exports: true });

    expect(readFixtureExports('bundleless')).toEqual({
      '.': './dist/esm/index.mjs',
    });
  });

  test('should fail when building only the umd format', async () => {
    const fixture = 'umd';
    const fixturePath = join(__dirname, fixture);
    const error = await expectBuildToFail(
      buildAndGetResults({ fixturePath, exports: true }),
    );

    expect(error.message).toContain('no entries can be exported');
    expect(readFileSync(join(fixturePath, 'package.json'), 'utf8')).toBe(
      packageJsonContents.get(fixture),
    );
  });

  test('should not generate exports when the build fails', async () => {
    const fixturePath = join(__dirname, 'build-error');
    await expectBuildToFail(buildAndGetResults({ fixturePath, exports: true }));

    expect(readFixtureExports('build-error')).toBeUndefined();
  });

  test('should generate exports when declaration files match the outputs', async () => {
    const fixturePath = join(__dirname, 'dts/matched');
    await buildAndGetResults({ fixturePath, exports: true });

    expect(readFixtureExports('dts/matched')).toEqual({
      '.': {
        import: './dist/esm/index.mjs',
        require: './dist/cjs/index.js',
      },
    });
  });

  test('should not add types conditions when the declaration file matches a single format output', async () => {
    const fixturePath = join(__dirname, 'dts/module');
    await buildAndGetResults({ fixturePath, exports: true });

    expect(readFixtureExports('dts/module')).toEqual({
      '.': './dist/esm/index.js',
    });
  });

  test('should share one declaration file when the extensions do not match', async () => {
    const fixturePath = join(__dirname, 'dts/shared');
    await buildAndGetResults({ fixturePath, exports: true });

    expect(readFixtureExports('dts/shared')).toEqual({
      '.': {
        types: './dist/esm/index.d.ts',
        import: './dist/esm/index.js',
        require: './dist/cjs/index.cjs',
      },
    });
  });

  test('should share one declaration file for the main entry in bundleless mode', async () => {
    const fixturePath = join(__dirname, 'dts/bundleless');
    await buildAndGetResults({ fixturePath, exports: true });

    expect(readFixtureExports('dts/bundleless')).toEqual({
      '.': {
        types: './dist/esm/index.d.ts',
        import: './dist/esm/index.js',
        require: './dist/cjs/index.cjs',
      },
    });
  });

  test('should fail when declaration files are not emitted next to the outputs', async () => {
    const fixture = 'dts/dist-path';
    const fixturePath = join(__dirname, fixture);
    const error = await expectBuildToFail(
      buildAndGetResults({ fixturePath, exports: true }),
    );

    expect(error.message).toContain(
      'no declaration files were found next to the outputs of the following libs that emit declaration files: "esm"',
    );
    expect(readFileSync(join(fixturePath, 'package.json'), 'utf8')).toBe(
      packageJsonContents.get(fixture),
    );
  });
});
