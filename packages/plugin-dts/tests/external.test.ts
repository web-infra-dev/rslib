import fs from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { logger } from '@rsbuild/core';
import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { calcBundledPackages, DEFAULT_EXCLUDED_PACKAGES } from '../src/dts';

const tempDirs: string[] = [];

const createTempDir = (): string => {
  const tempDir = fs.mkdtempSync(join(tmpdir(), 'rslib-plugin-dts-external-'));
  tempDirs.push(tempDir);
  return tempDir;
};

afterEach(() => {
  for (const tempDir of tempDirs) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  tempDirs.length = 0;
});

const defaultExcludePackages = DEFAULT_EXCLUDED_PACKAGES.reduce(
  (acc: Record<string, string>, cur: string) => {
    acc[cur] = '1.0.0';
    return acc;
  },
  {},
);

const commonPkgJson = {
  dependencies: {
    foo: '1.0.0',
  },
  peerDependencies: {
    baz: '1.0.0',
  },
  devDependencies: {
    baz: '1.0.0',
    bar: '1.0.0',
    ...defaultExcludePackages,
  },
};

describe('should calcBundledPackages correctly', () => {
  it('autoExternal is true', () => {
    rs.spyOn(fs, 'readFileSync').mockImplementation(() =>
      JSON.stringify(commonPkgJson),
    );

    const result = calcBundledPackages({
      autoExternal: true,
      cwd: 'pkg/to/root',
    });

    expect(result).toEqual(['bar']);
  });

  it('autoExternal is object', () => {
    rs.spyOn(fs, 'readFileSync').mockImplementation(() =>
      JSON.stringify(commonPkgJson),
    );
    const result = calcBundledPackages({
      autoExternal: {
        dependencies: false,
        peerDependencies: false,
        devDependencies: true,
      },
      cwd: 'pkg/to/root',
    });

    expect(result).toEqual(['foo']);
  });

  it('autoExternal is false', () => {
    rs.spyOn(fs, 'readFileSync').mockImplementation(() =>
      JSON.stringify(commonPkgJson),
    );
    const result = calcBundledPackages({
      autoExternal: false,
      cwd: 'pkg/to/root',
    });

    expect(result).toEqual(['foo', 'baz', 'bar']);
  });

  it('autoExternal with user externals', () => {
    rs.spyOn(fs, 'readFileSync').mockImplementation(() =>
      JSON.stringify({
        devDependencies: {
          baz: '1.0.0',
          bar: '1.0.0',
          react: '1.0.0',
          ...defaultExcludePackages,
        },
      }),
    );

    expect(
      calcBundledPackages({
        autoExternal: true,
        cwd: 'pkg/to/root',
        userExternals: [/react/, 'baz'],
      }),
    ).toEqual(['bar']);

    expect(
      calcBundledPackages({
        autoExternal: true,
        cwd: 'pkg/to/root',
        userExternals: 'baz',
      }),
    ).toEqual(['bar', 'react']);

    expect(
      calcBundledPackages({
        autoExternal: true,
        cwd: 'pkg/to/root',
        userExternals: {
          react: 'react',
        },
      }),
    ).toEqual(['baz', 'bar']);
  });

  it('read package.json failed', () => {
    rs.spyOn(logger, 'warn').mockImplementation(() => {});
    const result = calcBundledPackages({
      autoExternal: true,
      cwd: 'pkg/to/root',
    });

    expect(result).toEqual([]);
  });

  it('overrides with bundledPackages', () => {
    rs.spyOn(fs, 'readFileSync').mockImplementation(() =>
      JSON.stringify(commonPkgJson),
    );

    const result = calcBundledPackages({
      autoExternal: true,
      cwd: 'pkg/to/root',
      overrideBundledPackages: ['foo', '@bar/*'],
    });

    expect(result).toEqual(['foo', '@bar/*']);
  });

  it('autoExternal exclude with string', () => {
    rs.spyOn(fs, 'readFileSync').mockImplementation(() =>
      JSON.stringify(commonPkgJson),
    );

    // `foo` is excluded from auto externalization, so it is bundled.
    const result = calcBundledPackages({
      autoExternal: {
        exclude: ['foo'],
      },
      cwd: 'pkg/to/root',
    });

    expect(result).toEqual(['foo', 'bar']);
  });

  it('autoExternal exclude with RegExp', () => {
    rs.spyOn(fs, 'readFileSync').mockImplementation(() =>
      JSON.stringify(commonPkgJson),
    );

    // `baz` matches the RegExp and is excluded from auto externalization.
    const result = calcBundledPackages({
      autoExternal: {
        exclude: [/^ba/],
      },
      cwd: 'pkg/to/root',
    });

    expect(result).toEqual(['baz', 'bar']);
  });

  it('autoExternal exclude with global RegExp', () => {
    rs.spyOn(fs, 'readFileSync').mockImplementation(() =>
      JSON.stringify(commonPkgJson),
    );

    // Global regexps must be cloned to avoid `lastIndex` side effects.
    const result = calcBundledPackages({
      autoExternal: {
        exclude: /^ba/g,
      },
      cwd: 'pkg/to/root',
    });

    expect(result).toEqual(['baz', 'bar']);
  });

  it('autoExternal reads and merges packageJson files relative to cwd', () => {
    const cwd = createTempDir();
    fs.mkdirSync(join(cwd, 'packages', 'sub'), { recursive: true });
    fs.writeFileSync(
      join(cwd, 'package.json'),
      JSON.stringify({ devDependencies: { foo: '1.0.0' } }),
    );
    fs.writeFileSync(
      join(cwd, 'packages', 'sub', 'package.json'),
      JSON.stringify({ devDependencies: { bar: '1.0.0' } }),
    );

    const result = calcBundledPackages({
      autoExternal: {
        packageJson: ['./package.json', './packages/sub/package.json'],
      },
      cwd,
    });

    expect(result).toEqual(['foo', 'bar']);
  });
});

describe('should handle optionalDependencies in calcBundledPackages', () => {
  const optionalPkgJson = {
    dependencies: {
      foo: '1.0.0',
    },
    optionalDependencies: {
      opt: '1.0.0',
    },
  };

  it('optionalDependencies is bundled when autoExternal is false', () => {
    rs.spyOn(fs, 'readFileSync').mockImplementation(() =>
      JSON.stringify(optionalPkgJson),
    );

    const result = calcBundledPackages({
      autoExternal: false,
      cwd: 'pkg/to/root',
    });

    expect(result).toEqual(['foo', 'opt']);
  });

  it('optionalDependencies is bundled when optionalDependencies is false', () => {
    rs.spyOn(fs, 'readFileSync').mockImplementation(() =>
      JSON.stringify(optionalPkgJson),
    );

    const result = calcBundledPackages({
      autoExternal: {
        optionalDependencies: false,
      },
      cwd: 'pkg/to/root',
    });

    expect(result).toEqual(['opt']);
  });
});
