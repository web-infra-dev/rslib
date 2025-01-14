import { describe, expect, it, vi } from 'vitest';
import { composeAutoExternalConfig } from '../src/config';

vi.mock('rslog');

describe('should composeAutoExternalConfig correctly', () => {
  it('autoExternal default value', () => {
    const esmResult = composeAutoExternalConfig({
      bundle: true,
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
      bundle: true,
      format: 'cjs',
      autoExternal: undefined,
      pkgJson: {
        name: 'cjs',
        dependencies: {
          foo: '1.0.0',
        },
      },
    });

    const umdResult = composeAutoExternalConfig({
      bundle: true,
      format: 'umd',
      autoExternal: undefined,
      pkgJson: {
        name: 'umd',
        dependencies: {
          foo: '1.0.0',
        },
      },
    });

    const mfResult = composeAutoExternalConfig({
      bundle: true,
      format: 'mf',
      autoExternal: undefined,
      pkgJson: {
        name: 'mf',
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

    expect(umdResult).toMatchInlineSnapshot('{}');
    expect(mfResult).toMatchInlineSnapshot('{}');
  });

  it('autoExternal is true', () => {
    const result = composeAutoExternalConfig({
      bundle: true,
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

  it('autoExternal is true when format is umd or mf', () => {
    const umdResult = composeAutoExternalConfig({
      bundle: true,
      format: 'umd',
      autoExternal: true,
      pkgJson: {
        name: 'umd',
        dependencies: {
          foo: '1.0.0',
        },
      },
    });

    expect(umdResult).toMatchInlineSnapshot(`
      {
        "output": {
          "externals": [
            /\\^foo\\(\\$\\|\\\\/\\|\\\\\\\\\\)/,
            "foo",
          ],
        },
      }
    `);

    const mfResult = composeAutoExternalConfig({
      bundle: true,
      format: 'mf',
      autoExternal: true,
      pkgJson: {
        name: 'mf',
        dependencies: {
          foo: '1.0.0',
        },
      },
    });

    expect(mfResult).toMatchInlineSnapshot(`
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

  it('autoExternal will deduplication ', () => {
    const result = composeAutoExternalConfig({
      bundle: true,
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
      bundle: true,
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
      bundle: true,
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
      bundle: true,
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
      bundle: true,
      format: 'esm',
      autoExternal: true,
    });

    expect(result).toEqual({});
  });

  it('bundleless', () => {
    const result = composeAutoExternalConfig({
      bundle: false,
      format: 'esm',
      autoExternal: true,
    });

    expect(result).toStrictEqual({});
  });
});
