import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { beforeAll, describe, expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';

const normalizePath = (p: string): string => p.split('\\').join('/');

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : [p];
  });

const jsFiles = (dir: string): string[] =>
  walk(dir).filter((p) => p.endsWith('.js'));

const wasmFiles = (dir: string): string[] =>
  walk(dir).filter((p) => p.endsWith('.wasm'));

const expectSingleWasm = (dir: string, relPath: string) => {
  const files = wasmFiles(dir).map((p) => normalizePath(p));
  expect(files).toEqual([normalizePath(join(dir, relPath))]);
};

const loadDist = async (
  fixturePath: string,
  name: string,
  variant: string,
  entry = 'index.js',
): Promise<Record<string, unknown>> => {
  const entryPath = join(fixturePath, 'dist', name, variant, entry);
  return import(`${pathToFileURL(entryPath).href}?variant=${name}-${variant}`);
};

const expectUseAdd = async (
  fixturePath: string,
  name: string,
  variant: string,
  entry?: string,
) => {
  const mod = await loadDist(fixturePath, name, variant, entry);
  expect((mod.useAdd as (a: number, b: number) => number)(1, 2)).toBe(3);
};

const expectCreateAdd = async (
  fixturePath: string,
  name: string,
  variant: string,
) => {
  const mod = await loadDist(fixturePath, name, variant);
  const add = await (
    mod.createAdd as () =>
      | ((a: number, b: number) => number)
      | Promise<(a: number, b: number) => number>
  )();
  expect(add(1, 2)).toBe(3);
};

describe('wasm static', () => {
  const fixturePath = join(__dirname, 'static');

  beforeAll(async () => {
    await buildAndGetResults({ fixturePath });
  });

  test('handles default output paths', async () => {
    const compileBundleDir = join(fixturePath, 'dist/static/compile-bundle');
    await expectUseAdd(fixturePath, 'static', 'compile-bundle');
    expect(jsFiles(compileBundleDir).length).toBe(1);
    expect(wasmFiles(compileBundleDir).length).toBe(1);

    const compileBundlelessDir = join(
      fixturePath,
      'dist/static/compile-bundleless',
    );
    await expectUseAdd(fixturePath, 'static', 'compile-bundleless');
    expect(existsSync(join(compileBundlelessDir, 'add.js'))).toBe(false);
    expect(wasmFiles(compileBundlelessDir).length).toBe(1);

    const preserveBundleDir = join(fixturePath, 'dist/static/preserve-bundle');
    await expectUseAdd(fixturePath, 'static', 'preserve-bundle');
    expectSingleWasm(preserveBundleDir, 'static/wasm/add.wasm');

    const preserveBundlelessDir = join(
      fixturePath,
      'dist/static/preserve-bundleless',
    );
    await expectUseAdd(fixturePath, 'static', 'preserve-bundleless');
    expect(existsSync(join(preserveBundlelessDir, 'add.wasm'))).toBe(true);
  });

  test('handles a nested bundleless JS filename', async () => {
    const distDir = join(
      fixturePath,
      'dist/static/preserve-bundleless-nested-js',
    );
    await expectUseAdd(
      fixturePath,
      'static',
      'preserve-bundleless-nested-js',
      'js/index.js',
    );
    expectSingleWasm(distDir, 'add.wasm');
  });

  test('handles a nested bundled JS filename', async () => {
    const distDir = join(fixturePath, 'dist/static/preserve-bundle-nested-js');
    await expectUseAdd(
      fixturePath,
      'static',
      'preserve-bundle-nested-js',
      'js/index.js',
    );
    expectSingleWasm(distDir, 'static/wasm/add.wasm');
  });
});

test('wasm preserve respects non-default dist path', async () => {
  const fixturePath = join(__dirname, 'dist-path');
  await buildAndGetResults({ fixturePath });

  const preserveBundleDir = join(fixturePath, 'dist/dist-path/preserve-bundle');
  await expectUseAdd(fixturePath, 'dist-path', 'preserve-bundle');
  expectSingleWasm(preserveBundleDir, 'user-defined/wasm-assets/add.wasm');
});

test('wasm static source phase', async () => {
  const fixturePath = join(__dirname, 'static-source');
  await buildAndGetResults({ fixturePath });

  const compileBundleDir = join(
    fixturePath,
    'dist/static-source/compile-bundle',
  );
  await expectCreateAdd(fixturePath, 'static-source', 'compile-bundle');
  expect(jsFiles(compileBundleDir).length).toBe(1);
  expect(wasmFiles(compileBundleDir).length).toBe(1);

  const compileBundlelessDir = join(
    fixturePath,
    'dist/static-source/compile-bundleless',
  );
  await expectCreateAdd(fixturePath, 'static-source', 'compile-bundleless');
  expect(existsSync(join(compileBundlelessDir, 'add.js'))).toBe(false);
  expect(wasmFiles(compileBundlelessDir).length).toBe(1);

  const preserveBundleDir = join(
    fixturePath,
    'dist/static-source/preserve-bundle',
  );
  await expectCreateAdd(fixturePath, 'static-source', 'preserve-bundle');
  expect(jsFiles(preserveBundleDir).length).toBe(1);
  expectSingleWasm(preserveBundleDir, 'static/wasm/add.wasm');

  const preserveBundlelessDir = join(
    fixturePath,
    'dist/static-source/preserve-bundleless',
  );
  await expectCreateAdd(fixturePath, 'static-source', 'preserve-bundleless');
  expect(existsSync(join(preserveBundlelessDir, 'add.wasm'))).toBe(true);
});

test('wasm dynamic', async () => {
  const fixturePath = join(__dirname, 'dynamic');
  await buildAndGetResults({ fixturePath });

  const compileBundleDir = join(fixturePath, 'dist/dynamic/compile-bundle');
  await expectCreateAdd(fixturePath, 'dynamic', 'compile-bundle');
  expect(jsFiles(compileBundleDir).length).toBe(3);
  expect(wasmFiles(compileBundleDir).length).toBe(1);

  const compileBundlelessDir = join(
    fixturePath,
    'dist/dynamic/compile-bundleless',
  );
  await expectCreateAdd(fixturePath, 'dynamic', 'compile-bundleless');
  expect(jsFiles(compileBundlelessDir).length).toBe(4);
  expect(wasmFiles(compileBundlelessDir).length).toBe(1);

  const preserveBundleDir = join(fixturePath, 'dist/dynamic/preserve-bundle');
  await expectCreateAdd(fixturePath, 'dynamic', 'preserve-bundle');
  expect(jsFiles(preserveBundleDir).length).toBe(1);
  expectSingleWasm(preserveBundleDir, 'static/wasm/add.wasm');

  const preserveBundlelessDir = join(
    fixturePath,
    'dist/dynamic/preserve-bundleless',
  );
  await expectCreateAdd(fixturePath, 'dynamic', 'preserve-bundleless');
  expect(existsSync(join(preserveBundlelessDir, 'add.wasm'))).toBe(true);
});

test('wasm dynamic source phase', async () => {
  const fixturePath = join(__dirname, 'dynamic-source');
  await buildAndGetResults({ fixturePath });

  const compileBundleDir = join(
    fixturePath,
    'dist/dynamic-source/compile-bundle',
  );
  await expectCreateAdd(fixturePath, 'dynamic-source', 'compile-bundle');
  expect(jsFiles(compileBundleDir).length).toBe(3);
  expect(wasmFiles(compileBundleDir).length).toBe(1);

  const compileBundlelessDir = join(
    fixturePath,
    'dist/dynamic-source/compile-bundleless',
  );
  await expectCreateAdd(fixturePath, 'dynamic-source', 'compile-bundleless');
  expect(jsFiles(compileBundlelessDir).length).toBe(4);
  expect(wasmFiles(compileBundlelessDir).length).toBe(1);

  const preserveBundleDir = join(
    fixturePath,
    'dist/dynamic-source/preserve-bundle',
  );
  await expectCreateAdd(fixturePath, 'dynamic-source', 'preserve-bundle');
  expect(jsFiles(preserveBundleDir).length).toBe(1);
  expectSingleWasm(preserveBundleDir, 'static/wasm/add.wasm');

  const preserveBundlelessDir = join(
    fixturePath,
    'dist/dynamic-source/preserve-bundleless',
  );
  await expectCreateAdd(fixturePath, 'dynamic-source', 'preserve-bundleless');
  expect(existsSync(join(preserveBundlelessDir, 'add.wasm'))).toBe(true);
});
