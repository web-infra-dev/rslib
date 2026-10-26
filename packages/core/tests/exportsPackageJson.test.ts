import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, rs } from '@rstest/core';
import {
  findStaleSubpaths,
  mergeExports,
  stringifyPackageJson,
} from '../src/exports/packageJson';
import { logger } from '../src/utils/logger';

rs.mock('rslog');

describe('mergeExports', () => {
  it('should return the generated field when there is no existing field', () => {
    expect(mergeExports(undefined, { '.': './dist/index.mjs' })).toEqual({
      '.': './dist/index.mjs',
    });
  });

  it('should keep existing subpaths and overwrite conflicting ones in place', () => {
    const merged = mergeExports(
      {
        './style.css': './dist/style.css',
        '.': './dist/old.mjs',
        './package.json': './package.json',
      },
      { '.': './dist/index.mjs', './utils': './dist/utils.mjs' },
    );

    expect(Object.keys(merged)).toEqual([
      './style.css',
      '.',
      './package.json',
      './utils',
    ]);
    expect(merged).toEqual({
      './style.css': './dist/style.css',
      '.': './dist/index.mjs',
      './package.json': './package.json',
      './utils': './dist/utils.mjs',
    });
  });

  it('should put a newly added main subpath first', () => {
    const merged = mergeExports(
      { './package.json': './package.json' },
      { '.': './dist/index.mjs' },
    );

    expect(Object.keys(merged)).toEqual(['.', './package.json']);
  });

  it('should not add a main subpath when none is generated', () => {
    const merged = mergeExports(
      { './style.css': './dist/style.css' },
      { './utils': './dist/utils.mjs' },
    );

    expect(Object.keys(merged)).toEqual(['./style.css', './utils']);
  });

  it('should warn only when an existing subpath is overwritten with a different value', () => {
    const warn = rs.spyOn(logger, 'warn').mockImplementation(() => {});

    mergeExports(
      {
        '.': { import: './dist/index.mjs', require: './dist/index.js' },
        './utils': './dist/old-utils.mjs',
      },
      {
        '.': { import: './dist/index.mjs', require: './dist/index.js' },
        './utils': './dist/utils.mjs',
      },
    );

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toContain('"./utils"');
    warn.mockRestore();
  });

  it('should keep user conditions in place and replace generated conditions', () => {
    const merged = mergeExports(
      {
        '.': {
          '@acme/source': './src/index.ts',
          import: './dist/esm/old.mjs',
          browser: './dist/browser.js',
          require: './dist/cjs/old.js',
        },
      },
      {
        '.': {
          types: './dist/esm/index.d.ts',
          import: './dist/esm/index.mjs',
          require: './dist/cjs/index.js',
        },
      },
    );

    expect(Object.keys(merged['.'] as object)).toEqual([
      '@acme/source',
      'types',
      'import',
      'require',
      'browser',
    ]);
    expect(merged['.']).toEqual({
      '@acme/source': './src/index.ts',
      types: './dist/esm/index.d.ts',
      import: './dist/esm/index.mjs',
      require: './dist/cjs/index.js',
      browser: './dist/browser.js',
    });
  });

  it('should describe the merged value and warn once when it changes', () => {
    const warn = rs.spyOn(logger, 'warn').mockImplementation(() => {});
    const generated = { '.': { import: './dist/index.mjs' } };
    const merged = mergeExports(
      {
        '.': {
          '@acme/source': './src/index.ts',
          import: './dist/old.mjs',
        },
      },
      generated,
    );

    expect(warn).toHaveBeenCalledWith(
      'Updated the "." subpath in the "exports" field of package.json to {"@acme/source":"./src/index.ts","import":"./dist/index.mjs"}.',
    );
    mergeExports(merged, generated);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it('should drop stale generated conditions when switching to a single format', () => {
    expect(
      mergeExports(
        {
          '.': {
            '@acme/source': './src/index.ts',
            import: './dist/esm/index.mjs',
            require: './dist/cjs/index.js',
          },
          './utils': { import: './dist/utils.mjs', require: './dist/utils.js' },
        },
        { '.': './dist/esm/index.mjs', './utils': './dist/utils.mjs' },
      ),
    ).toEqual({
      '.': {
        '@acme/source': './src/index.ts',
        default: './dist/esm/index.mjs',
      },
      './utils': './dist/utils.mjs',
    });
  });

  it('should keep default last when merging user conditions', () => {
    const merged = mergeExports(
      { '.': { default: './dist/old.js', node: './dist/node.js' } },
      { '.': { types: './dist/index.d.ts', default: './dist/index.js' } },
    );

    expect(Object.keys(merged['.'] as object)).toEqual([
      'types',
      'node',
      'default',
    ]);
  });

  it('should preserve external types and fallback targets when only formats are generated', () => {
    const merged = mergeExports(
      {
        '.': {
          browser: './dist/browser.js',
          types: './types/index.d.ts',
          import: './dist/old.mjs',
          require: './dist/old.cjs',
          default: './dist/umd.js',
        },
      },
      { '.': { import: './dist/index.mjs', require: './dist/index.cjs' } },
    );

    expect(merged['.']).toEqual({
      browser: './dist/browser.js',
      types: './types/index.d.ts',
      import: './dist/index.mjs',
      require: './dist/index.cjs',
      default: './dist/umd.js',
    });
    expect(Object.keys(merged['.'] as object).at(-1)).toBe('default');
  });

  it('should preserve external types when generating a single output', () => {
    expect(
      mergeExports(
        { '.': { types: './types/index.d.ts', default: './dist/old.js' } },
        { '.': './dist/index.js' },
      ),
    ).toEqual({
      '.': { types: './types/index.d.ts', default: './dist/index.js' },
    });
  });

  it('should replace types when the build generates a declaration target', () => {
    expect(
      mergeExports(
        { '.': { types: './types/index.d.ts', default: './dist/old.js' } },
        { '.': { types: './dist/index.d.ts', default: './dist/index.js' } },
      ),
    ).toEqual({
      '.': { types: './dist/index.d.ts', default: './dist/index.js' },
    });
  });

  it.each([
    ['an array', ['./dist/index.mjs']],
    ['null', null],
  ])('should replace an existing %s subpath and warn', (_, value) => {
    const warn = rs.spyOn(logger, 'warn').mockImplementation(() => {});

    expect(mergeExports({ '.': value }, { '.': './dist/index.mjs' })).toEqual({
      '.': './dist/index.mjs',
    });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toContain('"."');
    warn.mockRestore();
  });

  it('should preserve array and null subpaths that are not generated', () => {
    expect(
      mergeExports(
        { './fallback': ['./dist/fallback.mjs'], './internal': null },
        { '.': './dist/index.mjs' },
      ),
    ).toEqual({
      '.': './dist/index.mjs',
      './fallback': ['./dist/fallback.mjs'],
      './internal': null,
    });
  });

  it.each([
    ['a string', './dist/index.mjs'],
    ['an object of conditions', { import: './dist/index.mjs' }],
    ['an array', ['./dist/index.mjs']],
    ['null', null],
  ])('should throw when the existing field is %s', (_, existing) => {
    expect(() => mergeExports(existing, { '.': './dist/index.mjs' })).toThrow(
      'is not a subpath map',
    );
  });
});

describe('findStaleSubpaths', () => {
  it('should find existing subpaths that point to missing files in the output directories', async () => {
    const root = await mkdtemp(join(tmpdir(), 'rslib-exports-stale-'));

    try {
      await mkdir(join(root, 'dist'));
      await writeFile(join(root, 'dist/style.css'), '');

      expect(
        findStaleSubpaths({
          existing: {
            '.': './dist/old.mjs',
            './old': { import: './dist/old.mjs', require: './dist/old.js' },
            './style.css': './dist/style.css',
            './src': './src/missing.ts',
            './*': './dist/*.mjs',
          },
          generated: { '.': './dist/index.mjs' },
          root,
          outputPaths: [join(root, 'dist')],
        }),
      ).toEqual(['./old']);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('should return an empty list when there is no existing field', () => {
    expect(
      findStaleSubpaths({
        existing: undefined,
        generated: { '.': './dist/index.mjs' },
        root: '/pkg',
        outputPaths: ['/pkg/dist'],
      }),
    ).toEqual([]);
  });
});

describe('stringifyPackageJson', () => {
  const content = { name: 'pkg', exports: { '.': './dist/index.mjs' } };

  it('should use two spaces when the original text has no indentation', () => {
    expect(stringifyPackageJson(content, '{}')).toBe(
      JSON.stringify(content, null, 2),
    );
  });

  it('should preserve tab indentation and the trailing newline', () => {
    expect(stringifyPackageJson(content, '{\n\t"name": "pkg"\n}\n')).toBe(
      `${JSON.stringify(content, null, '\t')}\n`,
    );
  });

  it('should preserve four-space indentation and CRLF line endings', () => {
    expect(
      stringifyPackageJson(content, '{\r\n    "name": "pkg"\r\n}\r\n'),
    ).toBe(`${JSON.stringify(content, null, 4).replaceAll('\n', '\r\n')}\r\n`);
  });
});
