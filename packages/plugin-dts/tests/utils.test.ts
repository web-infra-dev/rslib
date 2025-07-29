import { expect, test } from '@rstest/core';
import { mergeAliasWithTsConfigPaths, prettyTime } from '../src/utils';

test('should pretty time correctly', () => {
  expect(prettyTime(0.0012)).toEqual('0.001 s');
  expect(prettyTime(0.0123)).toEqual('0.01 s');
  expect(prettyTime(0.1234)).toEqual('0.12 s');
  expect(prettyTime(1.234)).toEqual('1.23 s');
  expect(prettyTime(12.34)).toEqual('12.3 s');
  expect(prettyTime(120)).toEqual('2 m');
  expect(prettyTime(123.4)).toEqual('2 m 3.4 s');
  expect(prettyTime(1234)).toEqual('20 m 34 s');
  expect(prettyTime(1234.5)).toEqual('20 m 34.5 s');
});

test('mergeAliasWithTsConfigPaths should handle empty inputs', () => {
  // Both undefined
  expect(
    mergeAliasWithTsConfigPaths(undefined, undefined),
  ).toMatchInlineSnapshot({}, '{}');

  // Empty objects
  expect(mergeAliasWithTsConfigPaths({}, {})).toMatchInlineSnapshot({}, '{}');

  // One empty, one undefined
  expect(mergeAliasWithTsConfigPaths({}, undefined)).toMatchInlineSnapshot(
    {},
    '{}',
  );
  expect(mergeAliasWithTsConfigPaths(undefined, {})).toMatchInlineSnapshot(
    {},
    '{}',
  );
});

test('mergeAliasWithTsConfigPaths should handle paths only', () => {
  const paths = {
    '@/*': ['./src/*'],
  };

  const result = mergeAliasWithTsConfigPaths(paths, undefined);

  expect(result).toMatchInlineSnapshot(`
    {
      "@/*": [
        "./src/*",
      ],
    }
  `);
});

test('mergeAliasWithTsConfigPaths should handle alias only', () => {
  const alias = {
    '@': './src',
  };

  const result = mergeAliasWithTsConfigPaths(undefined, alias);

  expect(result).toMatchInlineSnapshot(`
    {
      "@": [
        "./src",
      ],
    }
  `);
});

test('mergeAliasWithTsConfigPaths should handle alias overriding paths', () => {
  const paths = {
    '@utils/*': ['./lib/utils/*'],
    '@/*': ['./src/*'],
  };

  const alias = {
    '@utils/*': './src/utils',
    '@components': './src/components',
  };

  const result = mergeAliasWithTsConfigPaths(paths, alias);

  expect(Object.keys(result)).toMatchInlineSnapshot(`
    [
      "@utils/*",
      "@components",
      "@/*",
    ]
  `);
  expect(Object.values(result)).toMatchInlineSnapshot(`
    [
      [
        "./src/utils",
      ],
      [
        "./src/components",
      ],
      [
        "./src/*",
      ],
    ]
  `);
});
