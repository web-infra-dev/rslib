import { describe, expect, it, vi } from 'vitest';
import { composeAutoExternalConfig } from '../src/config';

vi.mock('rslog');

describe('should composeAutoExternalConfig correctly', () => {
  it('autoExternal is true', () => {
    const result = composeAutoExternalConfig({
      autoExternal: true,
      pkgJson: {
        dependencies: {
          foo: '1.0.0',
          foo1: '1.0.0',
        },
        devDependencies: {
          bar: '1.0.0',
        },
        peerDependencies: {
          baz: '1.0.0',
        },
      },
    });

    expect(result).toEqual({
      output: {
        externals: ['foo', 'foo1', 'baz'],
      },
    });
  });

  it('autoExternal will deduplication ', () => {
    const result = composeAutoExternalConfig({
      autoExternal: true,
      pkgJson: {
        dependencies: {
          foo: '1.0.0',
          foo1: '1.0.0',
        },
        devDependencies: {
          bar: '1.0.0',
        },
        peerDependencies: {
          baz: '1.0.0',
          foo: '1.0.0',
          foo1: '1.0.0',
        },
      },
    });

    expect(result).toEqual({
      output: {
        externals: ['foo', 'foo1', 'baz'],
      },
    });
  });

  it('autoExternal is object', () => {
    const result = composeAutoExternalConfig({
      autoExternal: {
        peerDependencies: false,
        devDependencies: true,
      },
      pkgJson: {
        dependencies: {
          foo: '1.0.0',
        },
        devDependencies: {
          bar: '1.0.0',
        },
        peerDependencies: {
          baz: '1.0.0',
        },
      },
    });

    expect(result).toEqual({
      output: {
        externals: ['foo', 'bar'],
      },
    });
  });

  it('autoExternal is false', () => {
    const result = composeAutoExternalConfig({
      autoExternal: false,
      pkgJson: {
        dependencies: {
          foo: '1.0.0',
        },
      },
    });

    expect(result).toEqual({});
  });

  it('autoExternal with user externals object', () => {
    const result = composeAutoExternalConfig({
      autoExternal: true,
      pkgJson: {
        dependencies: {
          foo: '1.0.0',
          bar: '1.0.0',
        },
      },
      userExternals: {
        foo: 'foo-1',
      },
    });

    expect(result).toEqual({
      output: {
        externals: ['bar'],
      },
    });
  });

  it('read package.json failed', () => {
    const result = composeAutoExternalConfig({
      autoExternal: true,
    });

    expect(result).toEqual({});
  });
});
