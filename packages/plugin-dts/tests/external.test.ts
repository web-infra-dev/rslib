import fs from 'node:fs';
import { logger } from '@rsbuild/core';
import { describe, expect, it, rs } from '@rstest/core';
import { calcBundledPackages } from '../src/dts';

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
});
