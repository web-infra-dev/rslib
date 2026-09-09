import path from 'node:path';
import { describe, expect, it, rs } from '@rstest/core';
import type {
  CollectedEntry,
  GenerateExportsOptions,
} from '../src/exports/generate';
import { generateExports } from '../src/exports/generate';
import type { RequireKey, RsbuildConfigWithLibInfo } from '../src/types';

rs.mock('rslog');

type LibInfo = RequireKey<RsbuildConfigWithLibInfo, 'id'>;

const createLibInfo = (id: string, format: LibInfo['format']): LibInfo => ({
  id,
  format,
  config: {} as unknown as LibInfo['config'],
});

const createCollected = (
  entries: Record<string, [entryName: string, jsFile: string][]>,
): Map<string, CollectedEntry[]> =>
  new Map(
    Object.entries(entries).map(([id, list]) => [
      id,
      list.map(([entryName, jsFile]) => ({ entryName, jsFile })),
    ]),
  );

describe('generateExports', () => {
  it('should generate import and require conditions for esm and cjs entries', () => {
    const options: GenerateExportsOptions = {
      libInfos: [createLibInfo('esm', 'esm'), createLibInfo('cjs', 'cjs')],
      collected: createCollected({
        esm: [['index', 'dist/esm/index.mjs']],
        cjs: [['index', 'dist/cjs/index.js']],
      }),
    };

    expect(generateExports(options)).toEqual({
      './package.json': './package.json',
      '.': {
        import: './dist/esm/index.mjs',
        require: './dist/cjs/index.js',
      },
    });
  });

  it('should generate a string value when only one format exists', () => {
    const options: GenerateExportsOptions = {
      libInfos: [createLibInfo('esm', 'esm')],
      collected: createCollected({
        esm: [['index', 'dist/esm/index.mjs']],
      }),
    };

    expect(generateExports(options)).toEqual({
      './package.json': './package.json',
      '.': './dist/esm/index.mjs',
    });
  });

  it('should expose non-index entries as subpaths', () => {
    const options: GenerateExportsOptions = {
      libInfos: [createLibInfo('esm', 'esm')],
      collected: createCollected({
        esm: [['foo', 'dist/esm/foo.mjs']],
      }),
    };

    expect(generateExports(options)).toEqual({
      './package.json': './package.json',
      './foo': './dist/esm/foo.mjs',
    });
  });

  it('should keep the index entry first and sort other entries', () => {
    const options: GenerateExportsOptions = {
      libInfos: [createLibInfo('esm', 'esm')],
      collected: createCollected({
        esm: [
          ['foo', 'dist/esm/foo.mjs'],
          ['utils/numbers', 'dist/esm/utils/numbers.mjs'],
          ['index', 'dist/esm/index.mjs'],
          ['bar', 'dist/esm/bar.mjs'],
        ],
      }),
    };

    const exportsField = generateExports(options);

    expect(Object.keys(exportsField!)).toEqual([
      './package.json',
      '.',
      './bar',
      './foo',
      './utils/numbers',
    ]);
    expect(exportsField).toEqual({
      './package.json': './package.json',
      '.': './dist/esm/index.mjs',
      './bar': './dist/esm/bar.mjs',
      './foo': './dist/esm/foo.mjs',
      './utils/numbers': './dist/esm/utils/numbers.mjs',
    });
  });

  it('should skip unsupported formats and keep supported ones', () => {
    const options: GenerateExportsOptions = {
      libInfos: [
        createLibInfo('esm', 'esm'),
        createLibInfo('umd', 'umd'),
        createLibInfo('mf', 'mf'),
      ],
      collected: createCollected({
        esm: [['index', 'dist/esm/index.mjs']],
        umd: [['index', 'dist/umd/index.js']],
        mf: [['index', 'dist/mf/index.js']],
      }),
    };

    expect(generateExports(options)).toEqual({
      './package.json': './package.json',
      '.': './dist/esm/index.mjs',
    });
  });

  it('should return undefined when all formats are unsupported', () => {
    const options: GenerateExportsOptions = {
      libInfos: [createLibInfo('umd', 'umd')],
      collected: createCollected({
        umd: [['index', 'dist/umd/index.js']],
      }),
    };

    expect(generateExports(options)).toBeUndefined();
  });

  it('should return undefined when no JavaScript entries are generated', () => {
    const options: GenerateExportsOptions = {
      libInfos: [createLibInfo('esm', 'esm')],
      collected: createCollected({
        esm: [],
      }),
    };

    expect(generateExports(options)).toBeUndefined();
  });

  it('should skip libs without collected entries', () => {
    const options: GenerateExportsOptions = {
      libInfos: [createLibInfo('esm', 'esm'), createLibInfo('cjs', 'cjs')],
      collected: createCollected({
        esm: [['index', 'dist/esm/index.mjs']],
      }),
    };

    expect(generateExports(options)).toEqual({
      './package.json': './package.json',
      '.': './dist/esm/index.mjs',
    });
  });

  it('should return undefined when an entry is outside the package root', () => {
    const options: GenerateExportsOptions = {
      libInfos: [createLibInfo('esm', 'esm')],
      collected: createCollected({
        esm: [['index', '../outside/index.mjs']],
      }),
    };

    expect(generateExports(options)).toBeUndefined();

    const absoluteOptions: GenerateExportsOptions = {
      libInfos: [createLibInfo('esm', 'esm')],
      collected: createCollected({
        esm: [['index', path.resolve(__dirname, 'outside/index.mjs')]],
      }),
    };

    expect(generateExports(absoluteOptions)).toBeUndefined();
  });

  it('should return undefined when an entry has multiple outputs of the same format', () => {
    const options: GenerateExportsOptions = {
      libInfos: [createLibInfo('esm', 'esm'), createLibInfo('esm2', 'esm')],
      collected: createCollected({
        esm: [['index', 'dist/esm/index.mjs']],
        esm2: [['index', 'dist/esm2/index.mjs']],
      }),
    };

    expect(generateExports(options)).toBeUndefined();
  });

  it('should allow duplicate identical outputs of the same format', () => {
    const options: GenerateExportsOptions = {
      libInfos: [createLibInfo('esm', 'esm'), createLibInfo('esm2', 'esm')],
      collected: createCollected({
        esm: [['index', 'dist/esm/index.mjs']],
        esm2: [['index', 'dist/esm/index.mjs']],
      }),
    };

    expect(generateExports(options)).toEqual({
      './package.json': './package.json',
      '.': './dist/esm/index.mjs',
    });
  });
});
