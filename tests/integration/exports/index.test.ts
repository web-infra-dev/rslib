import { createRslib } from '@rslib/core';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, describe, expect, test } from '@rstest/core';
import { buildAndGetResults, expectBuildToFail, rslibBuild } from 'test-helper';

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
  'include',
  'css',
  'source',
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

  test('should not generate exports in watch mode', async () => {
    const fixture = 'esm-only';
    const fixturePath = join(__dirname, fixture);
    const packageJsonPath = join(fixturePath, 'package.json');
    const original = packageJsonContents.get(fixture)!;
    writeFileSync(packageJsonPath, original);

    let onFirstBuild!: () => void;
    const firstBuild = new Promise<void>((resolve) => {
      onFirstBuild = resolve;
    });
    const rslib = await createRslib({
      cwd: fixturePath,
      config: {
        lib: [{ format: 'esm', output: { distPath: 'dist/esm' } }],
        source: { entry: { index: '../__fixtures__/src/index.ts' } },
        exports: true,
        logLevel: 'silent',
        plugins: [
          {
            name: 'test:first-build',
            setup(api) {
              // Run after the exports plugin to observe its writes.
              api.onAfterBuild({ order: 'post', handler: onFirstBuild });
            },
          },
        ],
      },
    });
    const buildResult = await rslib.build({ watch: true });

    try {
      await firstBuild;
      expect(readFileSync(packageJsonPath, 'utf8')).toBe(original);
    } finally {
      await buildResult.close();
    }
  });

  test('should not generate exports when building some libs', async () => {
    const fixture = 'esm-only';
    const fixturePath = join(__dirname, fixture);
    const packageJsonPath = join(fixturePath, 'package.json');
    const original = packageJsonContents.get(fixture)!;
    writeFileSync(packageJsonPath, original);

    const rslib = await createRslib({
      cwd: fixturePath,
      config: {
        lib: [
          { id: 'esm', format: 'esm', output: { distPath: 'dist/esm' } },
          { id: 'cjs', format: 'cjs', output: { distPath: 'dist/cjs' } },
        ],
        source: { entry: { index: '../__fixtures__/src/index.ts' } },
        exports: true,
        logLevel: 'silent',
      },
    });
    const buildResult = await rslib.build({ lib: ['esm'] });
    await buildResult.close();

    expect(readFileSync(packageJsonPath, 'utf8')).toBe(original);
  });

  test('should enable exports with the exports option in the config', async () => {
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

  test('should overwrite existing exports and preserve the formatting', async () => {
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
        '\t\t".": {',
        '\t\t\t"@acme/source": "./src/index.ts",',
        '\t\t\t"default": "./dist/esm/old.mjs"',
        '\t\t}',
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
        '\t\t".": "./dist/esm/index.mjs"',
        '\t}',
        '}',
        '',
      ].join('\n'),
    );
  });

  test('should overwrite existing exports in any form', async () => {
    const fixture = 'esm-only';
    const fixturePath = join(__dirname, fixture);
    writeFileSync(
      join(fixturePath, 'package.json'),
      JSON.stringify({ name: 'exports-esm-only-test', exports: './index.js' }),
    );

    await buildAndGetResults({ fixturePath, exports: true });

    expect(readFixtureExports(fixture)).toEqual({
      '.': './dist/esm/index.mjs',
    });
  });

  test('should apply an object custom to the generated exports', async () => {
    const fixture = 'esm-only';
    const fixturePath = join(__dirname, fixture);
    writeFileSync(
      join(fixturePath, 'package.json'),
      packageJsonContents.get(fixture)!,
    );

    await rslibBuild({
      cwd: fixturePath,
      modifyConfig: (config) => {
        config.exports = {
          custom: {
            '.': './dist/esm/replaced.mjs',
            './package.json': './package.json',
          },
        };
      },
    });

    expect(readFixtureExports(fixture)).toEqual({
      '.': './dist/esm/replaced.mjs',
      './package.json': './package.json',
    });
  });

  test('should apply an async function custom to the generated exports', async () => {
    const fixture = 'esm-only';
    const fixturePath = join(__dirname, fixture);
    writeFileSync(
      join(fixturePath, 'package.json'),
      packageJsonContents.get(fixture)!,
    );

    const contexts: unknown[] = [];
    await rslibBuild({
      cwd: fixturePath,
      modifyConfig: (config) => {
        config.exports = {
          custom: async (exports, context) => {
            contexts.push(context);
            return {
              ...exports,
              '.': { browser: './dist/browser.js', default: exports['.']! },
              './worker': './dist/esm/worker.mjs',
            };
          },
        };
      },
    });

    expect(readFixtureExports(fixture)).toEqual({
      '.': {
        browser: './dist/browser.js',
        default: './dist/esm/index.mjs',
      },
      './worker': './dist/esm/worker.mjs',
    });
    expect(contexts).toEqual([
      {
        pkg: JSON.parse(packageJsonContents.get(fixture)!),
        isPublish: false,
      },
    ]);
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

  test('should add a types condition for declaration files in dts.distPath', async () => {
    const fixturePath = join(__dirname, 'dts/dist-path');
    await buildAndGetResults({ fixturePath, exports: true });

    expect(readFixtureExports('dts/dist-path')).toEqual({
      '.': {
        types: './dist/types/index.d.ts',
        default: './dist/esm/index.js',
      },
    });
  });

  test('should select bundleless entries with include', async () => {
    const fixturePath = join(__dirname, 'include');
    await buildAndGetResults({ fixturePath });

    expect(readFixtureExports('include')).toEqual({
      '.': './dist/esm/index.mjs',
      './utils/numbers': './dist/esm/utils/numbers.mjs',
    });
  });

  test('should export the CSS of entries in bundle mode', async () => {
    const fixturePath = join(__dirname, 'css');
    await buildAndGetResults({ fixturePath, exports: true });

    expect(readFixtureExports('css')).toEqual({
      '.': {
        import: './dist/esm/index.mjs',
        require: './dist/cjs/index.js',
      },
      './index.css': './dist/esm/index.css',
      './theme.css': './dist/esm/theme.css',
    });
  });

  test('should select the JavaScript and CSS outputs separately', async () => {
    const fixture = 'css';
    const fixturePath = join(__dirname, fixture);
    writeFileSync(
      join(fixturePath, 'package.json'),
      packageJsonContents.get(fixture)!,
    );

    await rslibBuild({
      cwd: fixturePath,
      modifyConfig: (config) => {
        config.exports = { include: ['index.{js,mjs}', 'theme'] };
      },
    });

    expect(readFixtureExports(fixture)).toEqual({
      '.': {
        import: './dist/esm/index.mjs',
        require: './dist/cjs/index.js',
      },
      './theme.css': './dist/esm/theme.css',
    });
  });

  test('should point exports to source files and publish the outputs', async () => {
    const fixture = 'source';
    const fixturePath = join(__dirname, fixture);
    writeFileSync(
      join(fixturePath, 'package.json'),
      packageJsonContents.get(fixture)!,
    );

    const contexts: unknown[] = [];
    await rslibBuild({
      cwd: fixturePath,
      modifyConfig: (config) => {
        config.exports = {
          source: true,
          custom: (exports, { isPublish }) => {
            contexts.push(isPublish);
            return exports;
          },
        };
      },
    });

    const pkg = JSON.parse(
      readFileSync(join(fixturePath, 'package.json'), 'utf8'),
    );
    expect(pkg.exports).toEqual({ '.': './src/index.ts' });
    expect(pkg.publishConfig).toEqual({
      access: 'public',
      exports: {
        '.': {
          import: './dist/esm/index.mjs',
          require: './dist/cjs/index.js',
        },
      },
    });
    expect(contexts).toEqual([false, true]);
  });

  test('should add a source condition', async () => {
    const fixture = 'source';
    const fixturePath = join(__dirname, fixture);
    writeFileSync(
      join(fixturePath, 'package.json'),
      packageJsonContents.get(fixture)!,
    );

    await rslibBuild({
      cwd: fixturePath,
      modifyConfig: (config) => {
        config.exports = { source: '@acme/source' };
      },
    });

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
});
