import path from 'node:path';
import { describe, expect, it, rs } from '@rstest/core';
import {
  type DeclarationFile,
  findDeclarationFile,
  formatMissingDeclarations,
} from '../src/exports/dts';
import { type CollectedEntry, generateExports } from '../src/exports/generate';
import type { RequireKey, RsbuildConfigWithLibInfo } from '../src/types';

rs.mock('rslog');

type LibInfo = RequireKey<RsbuildConfigWithLibInfo, 'id'>;

const root = path.join(path.sep, 'pkg');

const createExists = (files: string[]) => {
  const set = new Set(files.map((file) => path.join(root, file)));
  return (file: string) => set.has(file);
};

describe('findDeclarationFile', () => {
  it.each([
    ['dist/index.js', 'dist/index.d.ts'],
    ['dist/index.jsx', 'dist/index.d.ts'],
    ['dist/index.mjs', 'dist/index.d.mts'],
    ['dist/index.cjs', 'dist/index.d.cts'],
  ])('should find the matched declaration file of %s', (jsFile, file) => {
    expect(findDeclarationFile(jsFile, root, createExists([file]))).toEqual({
      file,
      matched: true,
    });
  });

  it('should prefer the matched declaration file', () => {
    expect(
      findDeclarationFile(
        'dist/index.mjs',
        root,
        createExists(['dist/index.d.ts', 'dist/index.d.mts']),
      ),
    ).toEqual({ file: 'dist/index.d.mts', matched: true });
  });

  it('should fall back to a declaration file with another extension', () => {
    expect(
      findDeclarationFile(
        'dist/index.cjs',
        root,
        createExists(['dist/index.d.ts']),
      ),
    ).toEqual({ file: 'dist/index.d.ts', matched: false });
  });

  it('should return undefined when no declaration file exists', () => {
    expect(
      findDeclarationFile('dist/index.js', root, createExists([])),
    ).toBeUndefined();
  });
});

describe('formatMissingDeclarations', () => {
  it('should list the libs and the hint', () => {
    const message = formatMissingDeclarations(['esm', 'cjs']);

    expect(message).toContain('"esm", "cjs"');
    expect(message).toContain('check "dts.distPath"');
  });
});

describe('generateExports with declaration files', () => {
  const createLibInfo = (
    id: string,
    format: LibInfo['format'],
    dts?: LibInfo['dts'],
  ): LibInfo => ({
    id,
    format,
    config: {} as unknown as LibInfo['config'],
    ...(dts === undefined ? {} : { dts }),
  });

  const entry = (
    jsFile: string,
    declaration?: DeclarationFile,
  ): CollectedEntry => ({ entryName: 'index', jsFile, declaration });

  it('should not add a types condition when every output has a matched declaration file', () => {
    expect(
      generateExports({
        libInfos: [
          createLibInfo('esm', 'esm', { autoExtension: true }),
          createLibInfo('cjs', 'cjs', { autoExtension: true }),
        ],
        collected: new Map([
          [
            'esm',
            [
              entry('dist/esm/index.mjs', {
                file: 'dist/esm/index.d.mts',
                matched: true,
              }),
            ],
          ],
          [
            'cjs',
            [
              entry('dist/cjs/index.js', {
                file: 'dist/cjs/index.d.ts',
                matched: true,
              }),
            ],
          ],
        ]),
      }),
    ).toEqual({
      '.': { import: './dist/esm/index.mjs', require: './dist/cjs/index.js' },
    });
  });

  it('should share the matched declaration file when another output has none', () => {
    const exportsField = generateExports({
      libInfos: [
        createLibInfo('esm', 'esm', true),
        createLibInfo('cjs', 'cjs', true),
      ],
      collected: new Map([
        [
          'esm',
          [
            entry('dist/esm/index.js', {
              file: 'dist/esm/index.d.ts',
              matched: true,
            }),
          ],
        ],
        [
          'cjs',
          [
            entry('dist/cjs/index.cjs', {
              file: 'dist/cjs/index.d.ts',
              matched: false,
            }),
          ],
        ],
      ]),
    });

    expect(Object.keys(exportsField!['.']!)).toEqual([
      'types',
      'import',
      'require',
    ]);
    expect(exportsField).toEqual({
      '.': {
        types: './dist/esm/index.d.ts',
        import: './dist/esm/index.js',
        require: './dist/cjs/index.cjs',
      },
    });
  });

  it('should share the declaration file of the only lib that emits declaration files', () => {
    expect(
      generateExports({
        libInfos: [
          createLibInfo('esm', 'esm', true),
          createLibInfo('cjs', 'cjs'),
        ],
        collected: new Map([
          [
            'esm',
            [
              entry('dist/index.mjs', {
                file: 'dist/index.d.ts',
                matched: false,
              }),
            ],
          ],
          ['cjs', [entry('dist/index.js')]],
        ]),
      }),
    ).toEqual({
      '.': {
        types: './dist/index.d.ts',
        import: './dist/index.mjs',
        require: './dist/index.js',
      },
    });
  });

  it('should use the default condition with a single format', () => {
    expect(
      generateExports({
        libInfos: [createLibInfo('esm', 'esm', true)],
        collected: new Map([
          [
            'esm',
            [
              entry('dist/index.mjs', {
                file: 'dist/index.d.ts',
                matched: false,
              }),
            ],
          ],
        ]),
      }),
    ).toEqual({
      '.': { types: './dist/index.d.ts', default: './dist/index.mjs' },
    });
  });

  it('should throw when a lib has no declaration file next to any output', () => {
    expect(() =>
      generateExports({
        libInfos: [createLibInfo('esm', 'esm', { distPath: './dist/types' })],
        collected: new Map([['esm', [entry('dist/index.js')]]]),
      }),
    ).toThrow('"esm"');
  });

  it('should not add a types condition to subpaths without declaration files', () => {
    expect(
      generateExports({
        libInfos: [createLibInfo('esm', 'esm', true)],
        collected: new Map([
          [
            'esm',
            [
              entry('dist/index.js', {
                file: 'dist/index.d.ts',
                matched: true,
              }),
              { entryName: 'assets/logo', jsFile: 'dist/assets/logo.js' },
            ],
          ],
        ]),
      }),
    ).toEqual({
      '.': './dist/index.js',
      './assets/logo': './dist/assets/logo.js',
    });
  });

  it('should not throw for a bundleless lib without the index entry', () => {
    expect(
      generateExports({
        libInfos: [{ ...createLibInfo('esm', 'esm', true), bundle: false }],
        collected: new Map([
          [
            'esm',
            [{ entryName: 'utils/numbers', jsFile: 'dist/utils/numbers.js' }],
          ],
        ]),
      }),
    ).toBeUndefined();
  });

  it('should not check libs without declaration files', () => {
    expect(
      generateExports({
        libInfos: [createLibInfo('esm', 'esm')],
        collected: new Map([['esm', [entry('dist/index.js')]]]),
      }),
    ).toEqual({ '.': './dist/index.js' });
  });
});
