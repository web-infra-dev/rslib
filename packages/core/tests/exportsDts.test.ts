import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it, rs } from '@rstest/core';
import { type DeclarationFile, findDeclarationFile } from '../src/exports/dts';
import { type CollectedEntry, generateExports } from '../src/exports/generate';
import type { RequireKey, RsbuildConfigWithLibInfo } from '../src/types';

rs.mock('rslog');

type LibInfo = RequireKey<RsbuildConfigWithLibInfo, 'id'>;

const findWithFiles = async (
  jsFile: string,
  files: string[],
  dtsDistPath?: string,
) => {
  const root = await mkdtemp(path.join(tmpdir(), 'rslib-exports-dts-'));
  try {
    for (const file of files) {
      await mkdir(path.dirname(path.join(root, file)), { recursive: true });
      await writeFile(path.join(root, file), '');
    }
    return findDeclarationFile({
      jsFile,
      root,
      outputPath: path.join(root, 'dist'),
      dtsDistPath: dtsDistPath && path.join(root, dtsDistPath),
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
};

describe('findDeclarationFile', () => {
  it.each([
    ['dist/index.js', 'dist/index.d.ts'],
    ['dist/index.jsx', 'dist/index.d.ts'],
    ['dist/index.mjs', 'dist/index.d.mts'],
    ['dist/index.cjs', 'dist/index.d.cts'],
  ])('should find the matched declaration file of %s', async (jsFile, file) => {
    expect(await findWithFiles(jsFile, [file])).toEqual({
      file,
      matched: true,
    });
  });

  it('should prefer the matched declaration file', async () => {
    expect(
      await findWithFiles('dist/index.mjs', [
        'dist/index.d.ts',
        'dist/index.d.mts',
      ]),
    ).toEqual({ file: 'dist/index.d.mts', matched: true });
  });

  it('should fall back to a declaration file with another extension', async () => {
    expect(await findWithFiles('dist/index.cjs', ['dist/index.d.ts'])).toEqual({
      file: 'dist/index.d.ts',
      matched: false,
    });
  });

  it('should return undefined when no declaration file exists', async () => {
    expect(await findWithFiles('dist/index.js', [])).toBeUndefined();
  });

  it('should find the declaration file in dts.distPath as unmatched', async () => {
    expect(
      await findWithFiles(
        'dist/utils/numbers.js',
        ['dist/types/utils/numbers.d.ts'],
        'dist/types',
      ),
    ).toEqual({ file: 'dist/types/utils/numbers.d.ts', matched: false });
  });

  it('should look up next to the output when dts.distPath is the output directory', async () => {
    expect(
      await findWithFiles('dist/index.js', ['dist/index.d.ts'], 'dist'),
    ).toEqual({ file: 'dist/index.d.ts', matched: true });
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
  ): CollectedEntry => ({
    entryName: 'index',
    jsFile,
    declaration,
    sourceFiles: [],
  });

  const generate = (
    libInfos: LibInfo[],
    collected: Record<string, CollectedEntry[]>,
  ) =>
    generateExports({
      libInfos,
      collected: new Map(Object.entries(collected)),
      options: {},
    }).exports;

  it('should not add a types condition when every output has a matched declaration file', () => {
    expect(
      generate(
        [
          createLibInfo('esm', 'esm', { autoExtension: true }),
          createLibInfo('cjs', 'cjs', { autoExtension: true }),
        ],
        {
          esm: [
            entry('dist/esm/index.mjs', {
              file: 'dist/esm/index.d.mts',
              matched: true,
            }),
          ],
          cjs: [
            entry('dist/cjs/index.js', {
              file: 'dist/cjs/index.d.ts',
              matched: true,
            }),
          ],
        },
      ),
    ).toEqual({
      '.': { import: './dist/esm/index.mjs', require: './dist/cjs/index.js' },
    });
  });

  it('should share the matched declaration file when another output has none', () => {
    const exportsField = generate(
      [createLibInfo('esm', 'esm', true), createLibInfo('cjs', 'cjs', true)],
      {
        esm: [
          entry('dist/esm/index.js', {
            file: 'dist/esm/index.d.ts',
            matched: true,
          }),
        ],
        cjs: [
          entry('dist/cjs/index.cjs', {
            file: 'dist/cjs/index.d.ts',
            matched: false,
          }),
        ],
      },
    );

    expect(Object.keys(exportsField['.']!)).toEqual([
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
      generate(
        [createLibInfo('esm', 'esm', true), createLibInfo('cjs', 'cjs')],
        {
          esm: [
            entry('dist/index.mjs', {
              file: 'dist/index.d.ts',
              matched: false,
            }),
          ],
          cjs: [entry('dist/index.js')],
        },
      ),
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
      generate([createLibInfo('esm', 'esm', true)], {
        esm: [
          entry('dist/index.mjs', {
            file: 'dist/index.d.ts',
            matched: false,
          }),
        ],
      }),
    ).toEqual({
      '.': { types: './dist/index.d.ts', default: './dist/index.mjs' },
    });
  });

  it('should add a types condition for declaration files in dts.distPath', () => {
    expect(
      generate([createLibInfo('esm', 'esm', { distPath: './dist/types' })], {
        esm: [
          entry('dist/esm/index.js', {
            file: 'dist/types/index.d.ts',
            matched: false,
          }),
        ],
      }),
    ).toEqual({
      '.': { types: './dist/types/index.d.ts', default: './dist/esm/index.js' },
    });
  });

  it('should throw when a lib has no declaration file for any output', () => {
    expect(() =>
      generate([createLibInfo('esm', 'esm', true)], {
        esm: [entry('dist/index.js')],
      }),
    ).toThrow(
      'no declaration files were found for the outputs of the following libs that emit declaration files: "esm"',
    );
  });

  it('should skip the types condition without declaration files when abortOnError is disabled', () => {
    expect(
      generate([createLibInfo('esm', 'esm', { abortOnError: false })], {
        esm: [entry('dist/index.js')],
      }),
    ).toEqual({ '.': './dist/index.js' });
  });

  it('should not add a types condition to subpaths without declaration files', () => {
    expect(
      generate([createLibInfo('esm', 'esm', true)], {
        esm: [
          entry('dist/index.js', {
            file: 'dist/index.d.ts',
            matched: true,
          }),
          {
            entryName: 'assets/logo',
            jsFile: 'dist/assets/logo.js',
            sourceFiles: [],
          },
        ],
      }),
    ).toEqual({
      '.': './dist/index.js',
      './assets/logo': './dist/assets/logo.js',
    });
  });

  it('should not check libs without declaration files', () => {
    expect(
      generate([createLibInfo('esm', 'esm')], {
        esm: [entry('dist/index.js')],
      }),
    ).toEqual({ '.': './dist/index.js' });
  });
});
