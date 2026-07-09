import { describe, expect, test } from '@rstest/core';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { CompilerOptions } from 'typescript6-api';
import {
  cleanTsBuildInfoFile,
  loadTsconfigResultForExecutable,
  mergeAliasWithTsConfigPaths,
  prettyTime,
} from '../src/utils';

describe('prettyTime', () => {
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
});

describe('mergeAliasWithTsConfigPaths', () => {
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
});

describe('loadTsconfigResultForExecutable', () => {
  test('should load the options needed by the executable backend', async () => {
    const tempDir = await fs.mkdtemp(
      path.join(__dirname, 'executable-tsconfig-'),
    );

    try {
      const tsconfigPath = path.join(tempDir, 'tsconfig.json');
      await fs.writeFile(
        tsconfigPath,
        JSON.stringify(
          {
            compilerOptions: {
              declarationDir: 'types',
              outDir: 'dist',
              rootDir: 'src',
              tsBuildInfoFile: '.cache/build.tsbuildinfo',
            },
          },
          null,
          2,
        ),
      );

      const loaded = loadTsconfigResultForExecutable(tempDir, 'tsconfig.json');

      expect(path.normalize(loaded?.path ?? '')).toBe(
        path.normalize(tsconfigPath),
      );
      expect(loaded?.config).toEqual({
        options: {
          declarationDir: path.join(tempDir, 'types'),
          outDir: path.join(tempDir, 'dist'),
          rootDir: path.join(tempDir, 'src'),
          tsBuildInfoFile: path.join(tempDir, '.cache/build.tsbuildinfo'),
        },
      });
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });
});

describe('cleanTsBuildInfoFile', () => {
  const fileExists = async (filePath: string): Promise<boolean> => {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  };

  const testCases = [
    {
      name: 'default config without custom tsBuildInfoFile',
      config: { composite: true },
      expectedPath: 'tsconfig.case1.tsbuildinfo',
    },
    {
      name: 'custom tsBuildInfoFile path',
      config: {
        composite: true,
        tsBuildInfoFile: 'node_modules/.cache/tsconfig.case2.tsbuildinfo',
      },
      expectedPath: 'node_modules/.cache/tsconfig.case2.tsbuildinfo',
    },
    {
      name: 'outDir without rootDir',
      config: { composite: true, outDir: 'dist3' },
      expectedPath: 'dist3/tsconfig.case3.tsbuildinfo',
    },
    {
      name: 'outDir with rootDir',
      config: { composite: true, outDir: 'dist4', rootDir: 'src' },
      expectedPath: 'tsconfig.case4.tsbuildinfo',
    },
    {
      name: 'nested outDir with rootDir',
      config: { composite: true, outDir: 'dist/5', rootDir: 'src' },
      expectedPath: 'dist/tsconfig.case5.tsbuildinfo',
    },
  ];

  test('should clean tsBuildInfo files for various tsconfig configurations', async () => {
    delete process.env.NO_COLOR;
    const tempDir = await fs.mkdtemp(path.join(__dirname, 'temp-test-'));

    const srcPath = path.join(tempDir, 'src/index.ts');
    await fs.mkdir(path.dirname(srcPath), { recursive: true });
    await fs.writeFile(srcPath, 'export {}');

    try {
      await Promise.all(
        testCases.map(async (testCase, index) => {
          const caseNumber = index + 1;
          const tsconfigPath = path.join(
            tempDir,
            `tsconfig.case${caseNumber}.json`,
          );
          const expectedBuildInfoPath = path.join(
            tempDir,
            testCase.expectedPath,
          );

          await fs.writeFile(
            tsconfigPath,
            JSON.stringify({ compilerOptions: testCase.config }, null, 2),
          );

          // Create the file directly instead of running tsc for every case.
          await fs.mkdir(path.dirname(expectedBuildInfoPath), {
            recursive: true,
          });
          await fs.writeFile(
            path.join(tempDir, testCase.expectedPath),
            'Generated tsBuildInfo content',
          );

          expect(await fileExists(expectedBuildInfoPath)).toBe(true);

          const compilerOptions = Object.fromEntries(
            Object.entries(testCase.config).map(([key, value]) => [
              key,
              typeof value === 'string' ? path.join(tempDir, value) : value,
            ]),
          ) as CompilerOptions;
          await cleanTsBuildInfoFile(tsconfigPath, compilerOptions);

          expect(await fileExists(expectedBuildInfoPath)).toBe(false);
        }),
      );
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });
});
