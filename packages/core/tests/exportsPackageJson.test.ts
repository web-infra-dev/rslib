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
  const missing = new Set(['./dist/old.mjs', './dist/old.js']);
  const isStaleTarget = (target: string) => missing.has(target);

  it('should find existing subpaths that point to missing targets', () => {
    expect(
      findStaleSubpaths(
        {
          '.': './dist/old.mjs',
          './old': { import: './dist/old.mjs', require: './dist/old.js' },
          './style.css': './dist/style.css',
        },
        { '.': './dist/index.mjs' },
        isStaleTarget,
      ),
    ).toEqual(['./old']);
  });

  it('should return an empty list when there is no existing subpath map', () => {
    expect(
      findStaleSubpaths(undefined, { '.': './dist/index.mjs' }, isStaleTarget),
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
