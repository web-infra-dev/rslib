import { describe, expect, it, vi } from 'vitest';
import type { Format, PkgJson } from '../src/types';
import { getDefaultExtension } from '../src/utils/extension';

type Options = {
  format: Format;
  pkgJson?: PkgJson;
  autoExtension: boolean;
};

vi.mock('rslog');

describe('should get extension correctly', () => {
  it('autoExtension is false', () => {
    const options: Options = {
      format: 'cjs',
      pkgJson: {
        name: 'foo',
      },
      autoExtension: false,
    };

    const result = getDefaultExtension(options);

    expect(result).toEqual({
      jsExtension: '.js',
      dtsExtension: '.d.ts',
    });
  });

  it('package.json is broken', () => {
    const options: Options = {
      format: 'cjs',
      autoExtension: true,
    };

    const result = getDefaultExtension(options);

    expect(result).toEqual({
      jsExtension: '.js',
      dtsExtension: '.d.ts',
    });
  });

  it('format is cjs and type is module in package.json', () => {
    const options: Options = {
      format: 'cjs',
      pkgJson: {
        name: 'foo',
        type: 'module',
      },
      autoExtension: true,
    };

    const result = getDefaultExtension(options);

    expect(result).toEqual({
      jsExtension: '.cjs',
      dtsExtension: '.d.cts',
      isModule: true,
    });
  });

  it('format is cjs and type is commonjs in package.json', () => {
    const options: Options = {
      format: 'cjs',
      pkgJson: {
        name: 'foo',
        type: 'commonjs',
      },
      autoExtension: true,
    };

    const result = getDefaultExtension(options);

    expect(result).toEqual({
      jsExtension: '.js',
      dtsExtension: '.d.ts',
      isModule: false,
    });
  });

  it('format is esm and type is commonjs in package.json', () => {
    const options: Options = {
      format: 'esm',
      pkgJson: {
        name: 'foo',
        type: 'commonjs',
      },
      autoExtension: true,
    };

    const result = getDefaultExtension(options);

    expect(result).toEqual({
      jsExtension: '.mjs',
      dtsExtension: '.d.mts',
      isModule: false,
    });
  });

  it('format is esm and type is module in package.json', () => {
    const options: Options = {
      format: 'esm',
      pkgJson: {
        name: 'foo',
        type: 'module',
      },
      autoExtension: true,
    };

    const result = getDefaultExtension(options);

    expect(result).toEqual({
      jsExtension: '.js',
      dtsExtension: '.d.ts',
      isModule: true,
    });
  });
});
