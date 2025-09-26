import { describe, expect, test } from '@rstest/core';
import type { CommonOptions } from '../src/cli/commands';
import {
  applyCliOptions,
  parseEntryOption,
  parseSyntaxOption,
} from '../src/cli/initConfig';
import type { RslibConfig } from '../src/types';

describe('parseEntryOption', () => {
  test('returns undefined when entries are missing or empty', () => {
    expect(parseEntryOption()).toBeUndefined();
    expect(parseEntryOption([])).toBeUndefined();
    expect(parseEntryOption(['', '   '])).toBeUndefined();
  });

  test('parses named and positional entries with trimming', () => {
    const result = parseEntryOption([
      ' main = ./src/main.ts ',
      ' ./src/utils.ts ',
      'entry=./src/entry.ts',
      './src/extra.ts',
    ]);

    expect(result).toEqual({
      main: './src/main.ts',
      index: './src/utils.ts',
      entry: './src/entry.ts',
      entry2: './src/extra.ts',
    });
  });
});

describe('parseSyntaxOption', () => {
  test('returns undefined for missing or whitespace values', () => {
    expect(parseSyntaxOption()).toBeUndefined();
    expect(parseSyntaxOption('')).toBeUndefined();
    expect(parseSyntaxOption('    ')).toBeUndefined();
  });

  test('returns the trimmed ECMAScript version when not a JSON array', () => {
    expect(parseSyntaxOption(' es2020 ')).toBe('es2020');
  });

  test('parses JSON array syntax', () => {
    expect(parseSyntaxOption('["chrome 120", "firefox 115"]')).toEqual([
      'chrome 120',
      'firefox 115',
    ]);
  });

  test('throws descriptive error when JSON parsing fails', () => {
    const parseInvalidSyntax = () => parseSyntaxOption('[invalid');
    expect(parseInvalidSyntax).toThrowError(
      /Failed to parse --syntax option "\[inv.*JSON array/,
    );
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
      syntax: '["node 18"]',
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
      index: 'src/utils.ts',
      entry2: 'src/extra.ts',
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
