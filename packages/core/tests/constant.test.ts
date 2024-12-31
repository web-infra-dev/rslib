import { expect, test } from 'vitest';
import {
  CSS_EXTENSIONS_PATTERN,
  ENTRY_EXTENSIONS_PATTERN,
  JS_EXTENSIONS_PATTERN,
} from '../src/constant';

const jsTestStrings = [
  { str: 'index.js', expected: true },
  { str: './index.ts', expected: true },
  { str: './index.d.ts', expected: false },
  { str: '/Users/path/index.ts', expected: true },
  { str: '/Users/path/index.d.ts', expected: false },
  { str: '/Users/path/index.d.mts', expected: false },
  { str: '/Users/path/index.d.cts', expected: false },
  { str: '/Users/path/index.tsx', expected: true },
];

const cssTestStrings = [
  { str: 'index.css', expected: true },
  { str: './index.scss', expected: true },
  { str: './index.less', expected: true },
  { str: '/Users/path/index.scss', expected: true },
  { str: '/Users/path/index.less', expected: true },
  { str: '/Users/path/index.sass', expected: true },
];

test('JS_EXTENSIONS_PATTERN', () => {
  for (const { str, expected } of jsTestStrings) {
    expect(JS_EXTENSIONS_PATTERN.test(str)).toBe(expected);
  }
});

test('CSS_EXTENSIONS_PATTERN', () => {
  for (const { str, expected } of cssTestStrings) {
    expect(CSS_EXTENSIONS_PATTERN.test(str)).toBe(expected);
  }
});

test('ENTRY_EXTENSIONS_PATTERN', () => {
  for (const { str, expected } of [...jsTestStrings, ...cssTestStrings]) {
    expect(ENTRY_EXTENSIONS_PATTERN.test(str)).toBe(expected);
  }
});
