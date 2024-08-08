import { describe, expect, it, vi } from 'vitest';
import { applyAutoExternal } from '../src/utils/external';

vi.mock('rslog');

describe('should applyAutoExternal correctly', () => {
  it('autoExternal is true', () => {
    const result = applyAutoExternal({
      autoExternal: true,
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
        externals: ['foo', 'baz'],
      },
    });
  });

  it('autoExternal is object', () => {
    const result = applyAutoExternal({
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
    const result = applyAutoExternal({
      autoExternal: false,
      pkgJson: {
        dependencies: {
          foo: '1.0.0',
        },
      },
    });

    expect(result).toEqual({});
  });

  it('read package.json failed', () => {
    const result = applyAutoExternal({
      autoExternal: true,
    });

    expect(result).toEqual({});
  });
});
