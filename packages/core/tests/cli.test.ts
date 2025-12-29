import { describe, expect, test } from '@rstest/core';
import type { CommonOptions } from '../src/cli/commands';
import { applyCliOptions, parseEntryOption } from '../src/cli/init';
import type { RslibConfig } from '../src/types';

describe('parseEntryOption', () => {
  test('returns undefined when entries are missing or empty', () => {
    expect(parseEntryOption()).toBeUndefined();
    expect(parseEntryOption([])).toBeUndefined();
    expect(parseEntryOption(['', '   '])).toBeUndefined();
  });

  test('parses named entries with explicit keys', () => {
    const result = parseEntryOption([
      ' main = ./src/main.ts ',
      'entry=./src/entry.ts',
    ]);

    expect(result).toEqual({
      main: './src/main.ts',
      entry: './src/entry.ts',
    });
  });

  test('uses basename as key and handles conflicts with index suffix', () => {
    const result = parseEntryOption([
      './src/utils.ts', // unique basename
      './src/extra.js', // unique basename
      './components/Button.tsx', // unique basename
      './src/index.ts', // conflicts with other index files
      './pages/index.tsx', // conflicts with other index files
      './lib/index.js', // conflicts with other index files
      './src/home.ts', // conflicts with other home file
      'custom=./pages/custom.tsx', // explicit key (not affected by conflicts)
      './lib/home.js', // conflicts with other home file
    ]);

    expect(result).toEqual({
      utils: './src/utils.ts',
      extra: './src/extra.js',
      Button: './components/Button.tsx',
      index0: './src/index.ts',
      index1: './pages/index.tsx',
      index2: './lib/index.js',
      home0: './src/home.ts',
      custom: './pages/custom.tsx',
      home1: './lib/home.js',
    });
  });

  test('mixed named and unnamed entries with trimming', () => {
    const result = parseEntryOption([
      ' main = ./src/main.ts ',
      ' ./src/utils.ts ',
      'entry=./src/entry.ts',
      './src/extra.ts',
    ]);

    expect(result).toEqual({
      main: './src/main.ts',
      utils: './src/utils.ts',
      entry: './src/entry.ts',
      extra: './src/extra.ts',
    });
  });
});

describe('applyCliOptions', () => {
  test('applies CLI flags to the config and its libraries', () => {
    const config = {
      root: '/initial',
      logLevel: 'info',
      lib: [
        {
          format: 'esm',
          bundle: true,
          autoExtension: true,
          autoExternal: true,
          dts: false,
          syntax: 'esnext',
          source: {
            existing: true,
            entry: {
              index: './src/old.ts',
            },
          },
          output: {
            target: 'web',
            minify: false,
            cleanDistPath: true,
            externals: ['lodash'],
            distPath: {
              keep: 'value',
            },
          },
        },
      ],
      source: {},
      output: {},
    } as unknown as RslibConfig;

    const options = {
      root: './custom',
      logLevel: 'error',
      format: 'cjs',
      bundle: false,
      tsconfig: './tsconfig.build.json',
      entry: [' main=src/main.ts ', ' src/utils.ts ', 'src/extra.ts'],
      syntax: ['node 18'],
      dts: true,
      autoExtension: false,
      autoExternal: false,
      target: 'node',
      minify: true,
      clean: false,
      externals: ['react', '', 'lodash'],
      distPath: 'dist/custom',
    } as CommonOptions;

    const libBefore = config.lib[0]!;
    const outputBefore = libBefore.output;

    applyCliOptions(config, options, '/abs/custom');

    expect(config.root).toBe('/abs/custom');
    expect(config.logLevel).toBe('error');

    const lib = config.lib[0]!;
    expect(lib.format).toBe('cjs');
    expect(lib.bundle).toBe(false);
    expect(lib.dts).toBe(true);
    expect(lib.autoExtension).toBe(false);
    expect(lib.autoExternal).toBe(false);
    expect(lib.syntax).toEqual(['node 18']);
    expect(lib.source?.tsconfigPath).toBe('./tsconfig.build.json');
    expect(lib.source?.entry).toEqual({
      main: 'src/main.ts',
      utils: 'src/utils.ts',
      extra: 'src/extra.ts',
    });

    expect(lib.output).toBe(outputBefore);
    expect(lib.output?.target).toBe('node');
    expect(lib.output?.minify).toBe(true);
    expect(lib.output?.cleanDistPath).toBe(false);
    expect(lib.output?.externals).toEqual(['react', 'lodash']);
    expect(lib.output?.distPath).toEqual({
      keep: 'value',
      root: 'dist/custom',
    });
  });
});
