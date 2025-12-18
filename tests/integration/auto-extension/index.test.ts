import { extname, join } from 'node:path';
import { describe, expect, test } from '@rstest/core';
import {
  buildAndGetResults,
  generateFileTree,
  queryContent,
} from 'test-helper';

describe('autoExtension: true', () => {
  test('generate .mjs in build artifacts with esm format when type is commonjs', async () => {
    const fixturePath = join(__dirname, 'type-commonjs', 'default');
    const { entryFiles } = await buildAndGetResults({ fixturePath });
    expect(extname(entryFiles.esm!)).toEqual('.mjs');
    expect(extname(entryFiles.cjs!)).toEqual('.js');
  });

  test('generate .cjs in build artifacts with cjs format when type is module', async () => {
    const fixturePath = join(__dirname, 'type-module', 'default');
    const { entryFiles } = await buildAndGetResults({ fixturePath });
    expect(extname(entryFiles.esm!)).toEqual('.js');
    expect(extname(entryFiles.cjs!)).toEqual('.cjs');
  });
});

describe('autoExtension: false', () => {
  test('generate .js in both cjs and esm build artifacts when type is commonjs', async () => {
    const fixturePath = join(__dirname, 'type-commonjs', 'false');
    const { entryFiles } = await buildAndGetResults({ fixturePath });
    expect(extname(entryFiles.esm!)).toEqual('.js');
    expect(extname(entryFiles.cjs!)).toEqual('.js');
  });

  test('generate .js in both cjs and esm build artifacts when type is module', async () => {
    const fixturePath = join(__dirname, 'type-module', 'false');
    const { entryFiles } = await buildAndGetResults({ fixturePath });
    expect(extname(entryFiles.esm!)).toEqual('.js');
    expect(extname(entryFiles.cjs!)).toEqual('.js');
  });
});

describe('should respect output.filename.js and output.filenameHash to override builtin logic', () => {
  test('type is commonjs', async () => {
    const fixturePath = join(__dirname, 'type-commonjs', 'config-override');
    const { entryFiles } = await buildAndGetResults({ fixturePath });

    // override output.filename.js
    expect(extname(entryFiles.esm0!)).toEqual('.mjs');
    expect(entryFiles.cjs0).toMatchInlineSnapshot(
      `"<ROOT>/tests/integration/auto-extension/type-commonjs/config-override/dist/cjs-override-filename/index.a4fcc622.js"`,
    );

    // override output.filenameHash
    if (process.env.ADVANCED_ESM) {
      expect(entryFiles.esm1).toMatchInlineSnapshot(
        `"<ROOT>/tests/integration/auto-extension/type-commonjs/config-override/dist/esm-override-filename-hash/index.51786615.js"`,
      );
    } else {
      expect(entryFiles.esm1).toMatchInlineSnapshot(
        `"<ROOT>/tests/integration/auto-extension/type-commonjs/config-override/dist/esm-override-filename-hash/index.b4545719.js"`,
      );
    }
    expect(entryFiles.cjs1).toMatchInlineSnapshot(
      `"<ROOT>/tests/integration/auto-extension/type-commonjs/config-override/dist/cjs-override-filename-hash/index.a4fcc622.js"`,
    );

    // override different file types with function
    const fileTree = generateFileTree(
      join(fixturePath, './dist/cjs-override-filename-function'),
    );
    expect(fileTree).toMatchInlineSnapshot(`
      {
        "bar-image.js": "<ROOT>/tests/integration/auto-extension/type-commonjs/config-override/dist/cjs-override-filename-function/bar-image.js",
        "bar-index.js": "<ROOT>/tests/integration/auto-extension/type-commonjs/config-override/dist/cjs-override-filename-function/bar-index.js",
        "static": {
          "image": {
            "foo-image.png": "<ROOT>/tests/integration/auto-extension/type-commonjs/config-override/dist/cjs-override-filename-function/static/image/foo-image.png",
          },
        },
      }
    `);
  });

  test('type is module', async () => {
    const fixturePath = join(__dirname, 'type-module', 'config-override');
    const { entryFiles } = await buildAndGetResults({ fixturePath });

    // override output.filename.js
    if (process.env.ADVANCED_ESM) {
      expect(entryFiles.esm0).toMatchInlineSnapshot(
        `"<ROOT>/tests/integration/auto-extension/type-module/config-override/dist/esm-override-filename/index.51786615.js"`,
      );
    } else {
      expect(entryFiles.esm0).toMatchInlineSnapshot(
        `"<ROOT>/tests/integration/auto-extension/type-module/config-override/dist/esm-override-filename/index.b4545719.js"`,
      );
    }
    expect(extname(entryFiles.cjs0!)).toEqual('.cjs');

    // override output.filenameHash
    if (process.env.ADVANCED_ESM) {
      expect(entryFiles.esm1).toMatchInlineSnapshot(
        `"<ROOT>/tests/integration/auto-extension/type-module/config-override/dist/esm-override-filename-hash/index.51786615.js"`,
      );
    } else {
      expect(entryFiles.esm1).toMatchInlineSnapshot(
        `"<ROOT>/tests/integration/auto-extension/type-module/config-override/dist/esm-override-filename-hash/index.b4545719.js"`,
      );
    }
    expect(entryFiles.cjs1).toMatchInlineSnapshot(
      `"<ROOT>/tests/integration/auto-extension/type-module/config-override/dist/cjs-override-filename-hash/index.a4fcc622.js"`,
    );

    // override different file types with function
    const fileTree = generateFileTree(
      join(fixturePath, './dist/esm-override-filename-function'),
    );
    expect(fileTree).toMatchInlineSnapshot(`
      {
        "bar-image.js": "<ROOT>/tests/integration/auto-extension/type-module/config-override/dist/esm-override-filename-function/bar-image.js",
        "bar-index.js": "<ROOT>/tests/integration/auto-extension/type-module/config-override/dist/esm-override-filename-function/bar-index.js",
        "static": {
          "image": {
            "foo-image.png": "<ROOT>/tests/integration/auto-extension/type-module/config-override/dist/esm-override-filename-function/static/image/foo-image.png",
          },
        },
      }
    `);
  });
});

describe('ESM output should add main files automatically', () => {
  test('type is commonjs', async () => {
    const fixturePath = join(__dirname, 'type-commonjs', 'false-bundleless');
    const { contents } = await buildAndGetResults({ fixturePath });
    const { path: indexFile } = queryContent(contents.esm, 'index.js', {
      basename: true,
    });

    expect(await import(indexFile)).toMatchInlineSnapshot(`
      {
        "bar": "bar",
        "foo": "foo",
      }
    `);
  });

  test('type is module', async () => {
    const fixturePath = join(__dirname, 'type-module', 'false-bundleless');
    const { contents } = await buildAndGetResults({ fixturePath });
    const { path: indexFile } = queryContent(contents.esm, 'index.js', {
      basename: true,
    });

    expect(await import(indexFile)).toMatchInlineSnapshot(`
      {
        "bar": "bar",
        "foo": "foo",
      }
    `);
  });
});
