import { describe, expect, it, vi } from 'vitest';
import { composeAutoExternalConfig } from '../src/config';

vi.mock('rslog');

describe('should composeAutoExternalConfig correctly', () => {
  it('autoExternal is undefined', () => {
    const esmResult = composeAutoExternalConfig({
      format: 'esm',
      autoExternal: undefined,
      pkgJson: {
        name: 'esm',
        dependencies: {
          foo: '1.0.0',
        },
      },
    });

    const cjsResult = composeAutoExternalConfig({
      format: 'cjs',
      autoExternal: undefined,
      pkgJson: {
        name: 'cjs',
        dependencies: {
          foo: '1.0.0',
        },
      },
    });

    expect(esmResult).toMatchInlineSnapshot(`
      {
        "output": {
          "externals": [
            /\\^foo\\(\\$\\|\\\\/\\|\\\\\\\\\\)/,
            "foo",
          ],
        },
      }
    `);

    expect(cjsResult).toMatchInlineSnapshot(`
      {
        "output": {
          "externals": [
            /\\^foo\\(\\$\\|\\\\/\\|\\\\\\\\\\)/,
            "foo",
          ],
        },
      }
    `);
  });

  it('autoExternal should be disabled when format is umd or mf', () => {
    const umdResult = composeAutoExternalConfig({
      format: 'umd',
      autoExternal: undefined,
      pkgJson: {
        name: 'umd',
        dependencies: {
          foo: '1.0.0',
        },
      },
    });

    expect(umdResult).toMatchInlineSnapshot('{}');

    const mfResult = composeAutoExternalConfig({
      format: 'mf',
      autoExternal: undefined,
      pkgJson: {
        name: 'mf',
        dependencies: {
          foo: '1.0.0',
        },
      },
    });

    expect(mfResult).toMatchInlineSnapshot('{}');
  });

  it('autoExternal is true', () => {
    const result = composeAutoExternalConfig({
      format: 'esm',
      autoExternal: true,
      pkgJson: {
        name: 'esm',
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
        externals: [
          /^foo($|\/|\\)/,
          /^foo1($|\/|\\)/,
          /^baz($|\/|\\)/,
          'foo',
          'foo1',
          'baz',
        ],
      },
    });
  });

  it('autoExternal will deduplication ', () => {
    const result = composeAutoExternalConfig({
      format: 'esm',
      autoExternal: true,
      pkgJson: {
        name: 'esm',
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
        externals: [
          /^foo($|\/|\\)/,
          /^foo1($|\/|\\)/,
          /^baz($|\/|\\)/,
          'foo',
          'foo1',
          'baz',
        ],
      },
    });
  });

  it('autoExternal is object', () => {
    const result = composeAutoExternalConfig({
      format: 'esm',
      autoExternal: {
        peerDependencies: false,
        devDependencies: true,
      },
      pkgJson: {
        name: 'esm',
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
        externals: [/^foo($|\/|\\)/, /^bar($|\/|\\)/, 'foo', 'bar'],
      },
    });
  });

  it('autoExternal is false', () => {
    const result = composeAutoExternalConfig({
      format: 'esm',
      autoExternal: false,
      pkgJson: {
        name: 'esm',
        dependencies: {
          foo: '1.0.0',
        },
      },
    });

    expect(result).toEqual({});
  });

  it('autoExternal with user externals object', () => {
    const result = composeAutoExternalConfig({
      format: 'esm',
      autoExternal: true,
      pkgJson: {
        name: 'esm',
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
        externals: [/^bar($|\/|\\)/, 'bar'],
      },
    });
  });

  it('read package.json failed', () => {
    const result = composeAutoExternalConfig({
      format: 'esm',
      autoExternal: true,
    });

    expect(result).toEqual({});
  });
});
