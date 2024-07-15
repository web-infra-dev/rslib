import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getDefaultExtension } from '../src/utils/extension';

describe('should get extension correctly', () => {
  it('autoExtension is false', () => {
    const options = {
      format: 'cjs',
      root: '/path/to/root',
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
      root: '/path/to/root',
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
      root: join(__dirname, 'fixtures/extension/type-module'),
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
      root: join(__dirname, 'fixtures/extension/type-commonjs'),
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
      root: join(__dirname, 'fixtures/extension/type-commonjs'),
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
      root: join(__dirname, 'fixtures/extension/type-module'),
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
