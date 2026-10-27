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

const createLibInfo = (
  id: string,
  format: LibInfo['format'],
  info: Partial<LibInfo> = {},
): LibInfo => ({
  id,
  format,
  config: {} as unknown as LibInfo['config'],
  ...info,
});

const entry = (
  entryName: string,
  jsFile?: string,
  info: Partial<CollectedEntry> = {},
): CollectedEntry => ({ entryName, jsFile, sourceFiles: [], ...info });

/** A CSS output named by its path relative to an output directory under `dist`. */
const css = (
  file: string,
  name = file.replace(/^dist\/(esm\/|cjs\/)?/, ''),
) => ({
  file,
  name,
});

const generate = (
  libInfos: LibInfo[],
  collected: Record<string, CollectedEntry[]>,
  options: GenerateExportsOptions['options'] = {},
) =>
  generateExports({
    libInfos,
    collected: new Map(Object.entries(collected)),
    options,
  });

describe('generateExports', () => {
  it('should generate import and require conditions for esm and cjs entries', () => {
    expect(
      generate([createLibInfo('esm', 'esm'), createLibInfo('cjs', 'cjs')], {
        esm: [entry('index', 'dist/esm/index.mjs')],
        cjs: [entry('index', 'dist/cjs/index.js')],
      }),
    ).toEqual({
      exports: {
        '.': {
          import: './dist/esm/index.mjs',
          require: './dist/cjs/index.js',
        },
      },
    });
  });

  it('should generate a string value when only one format exists', () => {
    expect(
      generate([createLibInfo('esm', 'esm')], {
        esm: [entry('index', 'dist/esm/index.mjs')],
      }).exports,
    ).toEqual({ '.': './dist/esm/index.mjs' });
  });

  it('should name subpaths after entries and strip trailing "/index"', () => {
    expect(
      generate([createLibInfo('esm', 'esm')], {
        esm: [
          entry('index', 'dist/index.mjs'),
          entry('foo', 'dist/foo.mjs'),
          entry('button/index', 'dist/button/index.mjs'),
          entry('utils/numbers', 'dist/utils/numbers.mjs'),
        ],
      }).exports,
    ).toEqual({
      '.': './dist/index.mjs',
      './button': './dist/button/index.mjs',
      './foo': './dist/foo.mjs',
      './utils/numbers': './dist/utils/numbers.mjs',
    });
  });

  it('should normalize leading "./" in entry names', () => {
    expect(
      generate([createLibInfo('esm', 'esm'), createLibInfo('cjs', 'cjs')], {
        esm: [
          entry('./index', 'dist/esm/index.mjs'),
          entry('./foo/index', 'dist/esm/foo/index.mjs'),
        ],
        cjs: [
          entry('index', 'dist/cjs/index.js'),
          entry('foo/index', 'dist/cjs/foo/index.js'),
        ],
      }).exports,
    ).toEqual({
      '.': {
        import: './dist/esm/index.mjs',
        require: './dist/cjs/index.js',
      },
      './foo': {
        import: './dist/esm/foo/index.mjs',
        require: './dist/cjs/foo/index.js',
      },
    });
  });

  it('should throw when entries are exported as the same subpath', () => {
    expect(() =>
      generate([createLibInfo('esm', 'esm')], {
        esm: [
          entry('foo', 'dist/foo.mjs'),
          entry('foo/index', 'dist/foo/index.mjs'),
        ],
      }),
    ).toThrow(
      'the "foo" and "foo/index" entries are both exported as the "./foo" subpath',
    );
  });

  it('should keep the main subpath first and sort others by code units', () => {
    const { exports } = generate([createLibInfo('esm', 'esm')], {
      esm: [
        entry('foo', 'dist/foo.mjs'),
        entry('Bar', 'dist/Bar.mjs'),
        entry('index', 'dist/index.mjs'),
        entry('bar', 'dist/bar.mjs'),
      ],
    });

    expect(Object.keys(exports)).toEqual(['.', './Bar', './bar', './foo']);
  });

  it('should skip unsupported formats and keep supported ones', () => {
    expect(
      generate(
        [
          createLibInfo('esm', 'esm'),
          createLibInfo('umd', 'umd'),
          createLibInfo('mf', 'mf'),
        ],
        {
          esm: [entry('index', 'dist/esm/index.mjs')],
          umd: [entry('index', 'dist/umd/index.js')],
          mf: [entry('index', 'dist/mf/index.js')],
        },
      ).exports,
    ).toEqual({ '.': './dist/esm/index.mjs' });
  });

  it('should throw when no entries can be exported', () => {
    expect(() =>
      generate([createLibInfo('umd', 'umd')], {
        umd: [entry('index', 'dist/umd/index.js')],
      }),
    ).toThrow('no entries can be exported');

    expect(() => generate([createLibInfo('esm', 'esm')], { esm: [] })).toThrow(
      'no entries can be exported',
    );
  });

  it('should throw when an output is outside the package root', () => {
    expect(() =>
      generate([createLibInfo('esm', 'esm')], {
        esm: [entry('index', '../outside/index.mjs')],
      }),
    ).toThrow('which is outside the package root');

    expect(() =>
      generate([createLibInfo('esm', 'esm')], {
        esm: [entry('index', path.resolve(__dirname, 'outside/index.mjs'))],
      }),
    ).toThrow('which is outside the package root');
  });

  it('should throw when an entry has multiple outputs of the same format', () => {
    expect(() =>
      generate([createLibInfo('esm', 'esm'), createLibInfo('esm2', 'esm')], {
        esm: [entry('index', 'dist/esm/index.mjs')],
        esm2: [entry('index', 'dist/esm2/index.mjs')],
      }),
    ).toThrow('the "index" entry has multiple "esm" outputs');
  });

  it('should allow duplicate identical outputs of the same format', () => {
    expect(
      generate([createLibInfo('esm', 'esm'), createLibInfo('esm2', 'esm')], {
        esm: [entry('index', 'dist/esm/index.mjs')],
        esm2: [entry('index', 'dist/esm/index.mjs')],
      }).exports,
    ).toEqual({ '.': './dist/esm/index.mjs' });
  });
});

describe('generateExports with include and exclude', () => {
  const bundleless = createLibInfo('esm', 'esm', { bundle: false });
  const entries = [
    entry('index', 'dist/index.js'),
    entry('button/index', 'dist/button/index.js'),
    entry('button/utils', 'dist/button/utils.js'),
    entry('internal/index', 'dist/internal/index.js'),
  ];

  it('should only export the index entry in bundleless mode by default', () => {
    expect(generate([bundleless], { esm: entries }).exports).toEqual({
      '.': './dist/index.js',
    });
  });

  it('should export all entries in bundle mode by default', () => {
    expect(
      Object.keys(
        generate([createLibInfo('esm', 'esm')], { esm: entries }).exports,
      ),
    ).toEqual(['.', './button', './button/utils', './internal']);
  });

  it('should select entries with glob patterns', () => {
    expect(
      generate(
        [bundleless],
        { esm: entries },
        { include: ['index', '*/index'], exclude: ['internal/**'] },
      ).exports,
    ).toEqual({
      '.': './dist/index.js',
      './button': './dist/button/index.js',
    });
  });

  it('should throw when no entries match', () => {
    expect(() =>
      generate([bundleless], { esm: entries }, { include: ['missing'] }),
    ).toThrow('no entries can be exported');
  });
});

describe('generateExports with CSS', () => {
  it('should export the CSS of entries and prefer the esm output', () => {
    expect(
      generate([createLibInfo('cjs', 'cjs'), createLibInfo('esm', 'esm')], {
        cjs: [
          entry('index', 'dist/cjs/index.cjs', {
            css: css('dist/cjs/index.css'),
          }),
        ],
        esm: [
          entry('index', 'dist/esm/index.js', {
            css: css('dist/esm/index.css'),
          }),
          entry('button/index', 'dist/esm/button/index.js', {
            css: css('dist/esm/button/index.css'),
          }),
        ],
      }).exports,
    ).toEqual({
      '.': {
        import: './dist/esm/index.js',
        require: './dist/cjs/index.cjs',
      },
      './button': './dist/esm/button/index.js',
      './button/index.css': './dist/esm/button/index.css',
      './index.css': './dist/esm/index.css',
    });
  });

  it('should name CSS subpaths after the output files', () => {
    expect(
      generate([createLibInfo('cjs', 'cjs'), createLibInfo('esm', 'esm')], {
        cjs: [
          entry('index', 'dist/cjs/index.cjs', {
            css: css('dist/cjs/static/index.css', 'static/index.css'),
          }),
        ],
        esm: [
          entry('index', 'dist/esm/index.js', {
            css: css(
              'dist/esm/css/style.a1b2c3d4.css',
              'css/style.a1b2c3d4.css',
            ),
          }),
        ],
      }).exports,
    ).toEqual({
      '.': {
        import: './dist/esm/index.js',
        require: './dist/cjs/index.cjs',
      },
      './css/style.a1b2c3d4.css': './dist/esm/css/style.a1b2c3d4.css',
    });
  });

  it('should only export the CSS of CSS-only entries', () => {
    expect(
      generate([createLibInfo('esm', 'esm')], {
        esm: [
          entry('index', 'dist/index.js'),
          entry('theme', undefined, { css: css('dist/theme.css') }),
        ],
      }).exports,
    ).toEqual({
      '.': './dist/index.js',
      './theme.css': './dist/theme.css',
    });
  });

  it('should throw when a CSS subpath is taken by another entry', () => {
    expect(() =>
      generate([createLibInfo('esm', 'esm')], {
        esm: [
          entry('theme', 'dist/theme.js', { css: css('dist/theme.css') }),
          entry('theme.css', 'dist/theme.css.js'),
        ],
      }),
    ).toThrow('are both exported as the "./theme.css" subpath');
  });
});

describe('generateExports with source', () => {
  const libInfos = [createLibInfo('esm', 'esm'), createLibInfo('cjs', 'cjs')];
  const collected = {
    esm: [
      entry('index', 'dist/esm/index.js', {
        css: css('dist/esm/index.css'),
        sourceFiles: ['src/index.ts'],
      }),
    ],
    cjs: [
      entry('index', 'dist/cjs/index.cjs', { sourceFiles: ['src/index.ts'] }),
    ],
  };
  const outputExports = {
    '.': {
      import: './dist/esm/index.js',
      require: './dist/cjs/index.cjs',
    },
    './index.css': './dist/esm/index.css',
  };

  it('should point to source files and publish the outputs', () => {
    expect(generate(libInfos, collected, { source: true })).toEqual({
      exports: { '.': './src/index.ts' },
      publishExports: outputExports,
    });
  });

  it('should add a source condition to JavaScript subpaths', () => {
    expect(generate(libInfos, collected, { source: '@acme/source' })).toEqual({
      exports: {
        '.': {
          '@acme/source': './src/index.ts',
          import: './dist/esm/index.js',
          require: './dist/cjs/index.cjs',
        },
        './index.css': './dist/esm/index.css',
      },
    });

    expect(
      generate(
        [createLibInfo('esm', 'esm')],
        {
          esm: [
            entry('index', 'dist/index.js', { sourceFiles: ['src/index.ts'] }),
          ],
        },
        { source: '@acme/source' },
      ).exports,
    ).toEqual({
      '.': { '@acme/source': './src/index.ts', default: './dist/index.js' },
    });
  });

  it('should throw when an entry is built from multiple modules', () => {
    expect(() =>
      generate(
        [createLibInfo('esm', 'esm')],
        {
          esm: [
            entry('index', 'dist/index.js', {
              sourceFiles: ['src/index.ts', 'src/polyfill.ts'],
            }),
          ],
        },
        { source: true },
      ),
    ).toThrow('is built from 2 modules');
  });

  it('should throw when a source file is outside the package root', () => {
    expect(() =>
      generate(
        [createLibInfo('esm', 'esm')],
        {
          esm: [
            entry('index', 'dist/index.js', {
              sourceFiles: ['../src/index.ts'],
            }),
          ],
        },
        { source: true },
      ),
    ).toThrow('is outside the package root');
  });

  it('should throw when formats have different source files', () => {
    expect(() =>
      generate(
        libInfos,
        {
          esm: [
            entry('index', 'dist/esm/index.js', {
              sourceFiles: ['src/index.ts'],
            }),
          ],
          cjs: [
            entry('index', 'dist/cjs/index.cjs', {
              sourceFiles: ['src/index.cjs.ts'],
            }),
          ],
        },
        { source: true },
      ),
    ).toThrow('has different source files in different formats');
  });
});
