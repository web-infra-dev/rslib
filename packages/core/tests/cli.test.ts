import { describe, expect, test } from '@rstest/core';
import { parseEntryOption, parseSyntaxOption } from '../src/cli/initConfig';

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
