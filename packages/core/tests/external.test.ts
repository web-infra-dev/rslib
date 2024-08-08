import { describe, expect, it, vi } from 'vitest';
import { composeAutoExternal } from '../src/utils/external';

vi.mock('rslog');

describe('should composeAutoExternal correctly', () => {
  it('autoExternal is true', () => {
    const result = composeAutoExternal({
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

  it('autoExternal is object', () => {
    const result = composeAutoExternal({
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
    const result = composeAutoExternal({
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
    const result = composeAutoExternal({
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
    const result = composeAutoExternal({
      autoExternal: true,
    });

    expect(result).toEqual({});
  });
});
