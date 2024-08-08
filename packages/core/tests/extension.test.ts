import { describe, expect, it, vi } from 'vitest';
import { getDefaultExtension } from '../src/utils/extension';

vi.mock('rslog');

describe('should get extension correctly', () => {
  it('autoExtension is false', () => {
    const options = {
      format: 'cjs',
      pkgJson: {},
      autoExtension: false,
    };

    const result = getDefaultExtension(options);

    expect(result).toEqual({
      jsExtension: '.js',
      dtsExtension: '.d.ts',
    });
  });

  it('package.json is broken', () => {
    const options = {
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
    const options = {
      format: 'cjs',
      pkgJson: {
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
    const options = {
      format: 'cjs',
      pkgJson: {
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
    const options = {
      format: 'esm',
      pkgJson: {
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
    const options = {
      format: 'esm',
      pkgJson: {
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
