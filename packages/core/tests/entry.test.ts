import { describe, expect, test } from 'vitest';
import { appendEntryQuery } from '../src/config';

describe('appendEntryQuery', () => {
  test('string', () => {
    expect(
      appendEntryQuery({
        index: 'src/index.js',
        foo: 'src/foo.js',
      }),
    ).toMatchInlineSnapshot(`
      {
        "foo": "src/foo.js?__rslib_entry__",
        "index": "src/index.js?__rslib_entry__",
      }
    `);
  });

  test('string[]', () => {
    expect(
      appendEntryQuery({
        index: ['src/index.ts', 'src/extra.ts'],
        foo: ['src/foo.js'],
      }),
    ).toMatchInlineSnapshot(`
      {
        "foo": [
          "src/foo.js?__rslib_entry__",
        ],
        "index": [
          "src/index.ts?__rslib_entry__",
          "src/extra.ts?__rslib_entry__",
        ],
      }
    `);
  });

  test('Rspack.EntryDescription', () => {
    expect(
      appendEntryQuery({
        index: {
          import: ['src/index.ts', 'src/extra.ts'],
          layer: 'l1',
        },
        foo: {
          import: ['src/foo.js'],
          dependOn: ['src/dep.js'],
        },
      }),
    ).toMatchInlineSnapshot(`
      {
        "foo": {
          "dependOn": [
            "src/dep.js",
          ],
          "import": [
            "src/foo.js?__rslib_entry__",
          ],
        },
        "index": {
          "import": [
            "src/index.ts?__rslib_entry__",
            "src/extra.ts?__rslib_entry__",
          ],
          "layer": "l1",
        },
      }
    `);
  });

  test('combined', () => {
    expect(
      appendEntryQuery({
        index: {
          import: ['src/index.ts', 'src/extra.ts'],
          layer: 'l1',
        },
        foo: {
          import: ['src/foo.js'],
          dependOn: ['src/dep.js'],
        },
        bar: 'src/bar.ts',
        baz: ['src/baz.ts', 'src/bar.ts'],
      }),
    ).toMatchInlineSnapshot(`
      {
        "bar": "src/bar.ts?__rslib_entry__",
        "baz": [
          "src/baz.ts?__rslib_entry__",
          "src/bar.ts?__rslib_entry__",
        ],
        "foo": {
          "dependOn": [
            "src/dep.js",
          ],
          "import": [
            "src/foo.js?__rslib_entry__",
          ],
        },
        "index": {
          "import": [
            "src/index.ts?__rslib_entry__",
            "src/extra.ts?__rslib_entry__",
          ],
          "layer": "l1",
        },
      }
    `);
  });
});
