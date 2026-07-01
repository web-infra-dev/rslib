import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import { buildAndGetResults, queryContent } from 'test-helper';

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : [p];
  });

test('wasm static: compile + bundle', async () => {
  const fixturePath = join(__dirname, 'static-compile-bundle');
  const { contents } = await buildAndGetResults({ fixturePath });

  const { content: indexJs } = queryContent(contents.esm!, /index\.js/);
  // In compile mode the wasm export is wired through Rspack's runtime,
  // not preserved as a top-level ESM import.
  expect(indexJs).not.toMatch(/import\s*\{[^}]*\}\s*from\s*["'][^"']+\.wasm["']/);
  expect(indexJs).toContain('useAdd');

  const distDir = join(fixturePath, 'dist/esm');
  // Bundle mode collapses utils.js into the single entry chunk.
  const jsFiles = walk(distDir).filter((p) => p.endsWith('.js'));
  expect(jsFiles.length).toBe(1);

  const wasmFiles = walk(distDir).filter((p) => p.endsWith('.wasm'));
  expect(wasmFiles.length).toBe(1);
});

test('wasm static: compile + bundleless', async () => {
  const fixturePath = join(__dirname, 'static-compile-bundleless');
  const { contents } = await buildAndGetResults({ fixturePath });

  const { content: utilsJs } = queryContent(contents.esm!, /utils\.js/);
  // In compile mode the wasm export is wired through Rspack's runtime,
  // not preserved as a top-level ESM import.
  expect(utilsJs).not.toMatch(/import\s*\{[^}]*\}\s*from\s*["'][^"']+\.wasm["']/);
  expect(utilsJs).toContain('useAdd');

  const distDir = join(fixturePath, 'dist/esm');
  expect(existsSync(join(distDir, 'add.js'))).toBe(false);
  const wasmFiles = walk(distDir).filter((p) => p.endsWith('.wasm'));
  expect(wasmFiles.length).toBe(1);
});

test('wasm static source phase: compile + bundle', async () => {
  const fixturePath = join(__dirname, 'static-source-compile-bundle');
  const { contents } = await buildAndGetResults({ fixturePath });

  const { content: indexJs } = queryContent(contents.esm!, /index\.js/);
  // Bundle mode collapses utils.js into index.js. Compile mode lowers source
  // phase imports into Rspack's wasm runtime, so no native source import leaks.
  expect(indexJs).toContain('createAdd');
  expect(indexJs).toContain('WebAssembly.Instance');
  expect(indexJs).not.toContain('import source');
  expect(indexJs).not.toMatch(/from\s*["'][^"']+\.wasm["']/);

  const distDir = join(fixturePath, 'dist/esm');
  const jsFiles = walk(distDir).filter((p) => p.endsWith('.js'));
  expect(jsFiles.length).toBe(1);

  const wasmFiles = walk(distDir).filter((p) => p.endsWith('.wasm'));
  expect(wasmFiles.length).toBe(1);
});

test('wasm static source phase: compile + bundleless', async () => {
  const fixturePath = join(__dirname, 'static-source-compile-bundleless');
  const { contents } = await buildAndGetResults({ fixturePath });

  const { content: indexJs } = queryContent(contents.esm!, /index\.js/);
  const { content: utilsJs } = queryContent(contents.esm!, /utils\.js/);
  // Bundleless mode keeps the index -> utils boundary.
  expect(indexJs).toMatch(/from\s*["']\.\/utils\.js["']/);
  expect(indexJs).not.toMatch(/\.wasm/);

  // Compile mode should not preserve native source phase imports in the public
  // output; the wasm is lowered into a JS module next to utils.js.
  expect(utilsJs).toContain('createAdd');
  expect(utilsJs).toContain('WebAssembly.Instance');
  expect(utilsJs).not.toContain('import source');
  expect(utilsJs).not.toMatch(/from\s*["'][^"']+\.wasm["']/);

  const distDir = join(fixturePath, 'dist/esm');
  expect(existsSync(join(distDir, 'add.js'))).toBe(false);
  const wasmFiles = walk(distDir).filter((p) => p.endsWith('.wasm'));
  expect(wasmFiles.length).toBe(1);
});

test('wasm dynamic: compile + bundle', async () => {
  const fixturePath = join(__dirname, 'dynamic-compile-bundle');
  const { contents } = await buildAndGetResults({ fixturePath });

  const { content: indexJs } = queryContent(contents.esm!, /index\.js/);
  expect(indexJs).toContain('createAdd');
  expect(indexJs).toContain('import("./add.js")');
  expect(indexJs).not.toMatch(/from\s*["'][^"']+\.wasm["']/);

  const distDir = join(fixturePath, 'dist/esm');
  const jsFiles = walk(distDir).filter((p) => p.endsWith('.js'));
  expect(jsFiles.length).toBe(3);
  expect(existsSync(join(distDir, 'add.js'))).toBe(true);
  const wasmFiles = walk(distDir).filter((p) => p.endsWith('.wasm'));
  expect(wasmFiles.length).toBe(1);
});

test('wasm dynamic: compile + bundleless', async () => {
  const fixturePath = join(__dirname, 'dynamic-compile-bundleless');
  const { contents } = await buildAndGetResults({ fixturePath });

  const { content: indexJs } = queryContent(contents.esm!, /index\.js/);
  const { content: utilsJs } = queryContent(contents.esm!, /utils\.js/);
  expect(indexJs).toMatch(/from\s*["']\.\/utils\.js["']/);
  expect(indexJs).not.toMatch(/\.wasm/);

  expect(utilsJs).toContain('createAdd');
  expect(utilsJs).toContain('import("./add.js")');
  expect(utilsJs).not.toMatch(/from\s*["'][^"']+\.wasm["']/);

  const distDir = join(fixturePath, 'dist/esm');
  expect(existsSync(join(distDir, 'add.js'))).toBe(true);
  const wasmFiles = walk(distDir).filter((p) => p.endsWith('.wasm'));
  expect(wasmFiles.length).toBe(1);
});

test('wasm dynamic source phase: compile + bundle', async () => {
  const fixturePath = join(__dirname, 'dynamic-source-compile-bundle');
  const { contents } = await buildAndGetResults({ fixturePath });

  const { content: indexJs } = queryContent(contents.esm!, /index\.js/);
  expect(indexJs).toContain('createAdd');
  expect(indexJs).toContain('import("./add.js")');
  expect(indexJs).toContain('WebAssembly.Instance');
  expect(indexJs).not.toMatch(/from\s*["'][^"']+\.wasm["']/);

  const distDir = join(fixturePath, 'dist/esm');
  const jsFiles = walk(distDir).filter((p) => p.endsWith('.js'));
  expect(jsFiles.length).toBe(3);
  const wasmFiles = walk(distDir).filter((p) => p.endsWith('.wasm'));
  expect(wasmFiles.length).toBe(1);
});

test('wasm dynamic source phase: compile + bundleless', async () => {
  const fixturePath = join(__dirname, 'dynamic-source-compile-bundleless');
  const { contents } = await buildAndGetResults({ fixturePath });

  const { content: indexJs } = queryContent(contents.esm!, /index\.js/);
  const { content: utilsJs } = queryContent(contents.esm!, /utils\.js/);
  expect(indexJs).toMatch(/from\s*["']\.\/utils\.js["']/);
  expect(indexJs).not.toMatch(/\.wasm/);

  expect(utilsJs).toContain('createAdd');
  expect(utilsJs).toContain('WebAssembly.Instance');
  expect(utilsJs).toContain('import("./add.js")');
  expect(utilsJs).not.toMatch(/from\s*["'][^"']+\.wasm["']/);

  const distDir = join(fixturePath, 'dist/esm');
  expect(existsSync(join(distDir, 'add.js'))).toBe(true);
  const wasmFiles = walk(distDir).filter((p) => p.endsWith('.wasm'));
  expect(wasmFiles.length).toBe(1);
});

test('wasm static: preserve + bundle', async () => {
  const fixturePath = join(__dirname, 'static-preserve-bundle');
  const { contents } = await buildAndGetResults({ fixturePath });

  const { content: indexJs } = queryContent(contents.esm!, /index\.js/);
  // Bundle mode inlines utils into index, so the preserved wasm import is in index.js.
  expect(indexJs).toMatch(
    /import\s*\{\s*add\s*\}\s*from\s*["']\.\/[^"']+\.wasm["']/,
  );

  const distDir = join(fixturePath, 'dist/esm');
  const emitted = walk(distDir).filter((p) => p.endsWith('.wasm'));
  expect(emitted.length).toBe(1);
  // bundle + preserve uses a content-hashed filename, not the source filename.
  expect(emitted[0]).not.toMatch(/[/\\]add\.wasm$/);
});

test('wasm static source phase: preserve + bundle', async () => {
  const fixturePath = join(__dirname, 'static-source-preserve-bundle');
  const { contents } = await buildAndGetResults({ fixturePath });

  const { content: indexJs } = queryContent(contents.esm!, /index\.js/);
  // Bundle mode collapses utils.js into index.js, and preserve mode keeps the
  // native source phase import pointing at the emitted wasm asset.
  expect(indexJs).toContain('createAdd');
  expect(indexJs).toMatch(
    /import\s+source(?:\s+\w+)?\s+from\s*["']\.\/[^"']+\.wasm["']/,
  );

  const distDir = join(fixturePath, 'dist/esm');
  const jsFiles = walk(distDir).filter((p) => p.endsWith('.js'));
  expect(jsFiles.length).toBe(1);
  const emitted = walk(distDir).filter((p) => p.endsWith('.wasm'));
  expect(emitted.length).toBe(1);
  expect(emitted[0]).not.toMatch(/[/\\]add\.wasm$/);
});

test('wasm dynamic: preserve + bundle', async () => {
  const fixturePath = join(__dirname, 'dynamic-preserve-bundle');
  const { contents } = await buildAndGetResults({ fixturePath });

  const { content: indexJs } = queryContent(contents.esm!, /index\.js/);
  expect(indexJs).toContain('createAdd');
  expect(indexJs).toContain('import("./');
  expect(indexJs).toMatch(/\.wasm["']\)/);

  const distDir = join(fixturePath, 'dist/esm');
  const jsFiles = walk(distDir).filter((p) => p.endsWith('.js'));
  expect(jsFiles.length).toBe(1);
  const emitted = walk(distDir).filter((p) => p.endsWith('.wasm'));
  expect(emitted.length).toBe(1);
  expect(emitted[0]).not.toMatch(/[/\\]add\.wasm$/);
});

test('wasm dynamic source phase: preserve + bundle', async () => {
  const fixturePath = join(__dirname, 'dynamic-source-preserve-bundle');
  const { contents } = await buildAndGetResults({ fixturePath });

  const { content: indexJs } = queryContent(contents.esm!, /index\.js/);
  expect(indexJs).toContain('createAdd');
  expect(indexJs).toContain('import.source("./static/wasm/');
  expect(indexJs).toMatch(/\.wasm["']\)/);

  const distDir = join(fixturePath, 'dist/esm');
  const jsFiles = walk(distDir).filter((p) => p.endsWith('.js'));
  expect(jsFiles.length).toBe(1);
  const emitted = walk(distDir).filter((p) => p.endsWith('.wasm'));
  expect(emitted.length).toBe(1);
  expect(emitted[0]).not.toMatch(/[/\\]add\.wasm$/);
});

test('wasm static: preserve + bundleless', async () => {
  const fixturePath = join(__dirname, 'static-preserve-bundleless');
  const { contents } = await buildAndGetResults({ fixturePath });

  const { content: indexJs } = queryContent(contents.esm!, /index\.js/);
  const { content: utilsJs } = queryContent(contents.esm!, /utils\.js/);

  // index.js re-exports from ./utils.js, not from the wasm directly.
  expect(indexJs).toMatch(/from\s*["']\.\/utils\.js["']/);
  expect(indexJs).not.toMatch(/\.wasm/);

  // bundleless + preserve keeps the original wasm filename next to the source layout.
  expect(utilsJs).toContain('import { add } from "./add.wasm"');

  const distDir = join(fixturePath, 'dist/esm');
  expect(existsSync(join(distDir, 'add.wasm'))).toBe(true);
});

test('wasm dynamic: preserve + bundleless', async () => {
  const fixturePath = join(__dirname, 'dynamic-preserve-bundleless');
  const { contents } = await buildAndGetResults({ fixturePath });

  const { content: indexJs } = queryContent(contents.esm!, /index\.js/);
  const { content: utilsJs } = queryContent(contents.esm!, /utils\.js/);
  expect(indexJs).toMatch(/from\s*["']\.\/utils\.js["']/);
  expect(indexJs).not.toMatch(/\.wasm/);

  expect(utilsJs).toContain('createAdd');
  expect(utilsJs).toContain('import("./add.wasm")');

  const distDir = join(fixturePath, 'dist/esm');
  expect(existsSync(join(distDir, 'add.wasm'))).toBe(true);
});

test('wasm static source phase: preserve + bundleless', async () => {
  const fixturePath = join(__dirname, 'static-source-preserve-bundleless');
  const { contents } = await buildAndGetResults({ fixturePath });

  const { content: indexJs } = queryContent(contents.esm!, /index\.js/);
  const { content: utilsJs } = queryContent(contents.esm!, /utils\.js/);

  // Bundleless mode keeps the index -> utils boundary.
  expect(indexJs).toMatch(/from\s*["']\.\/utils\.js["']/);
  expect(indexJs).not.toMatch(/\.wasm/);

  // Preserve mode keeps the native source phase import and the source-relative
  // wasm file layout.
  expect(utilsJs).toContain('createAdd');
  expect(utilsJs).toMatch(/import source \w+ from "\.\/add\.wasm"/);

  const distDir = join(fixturePath, 'dist/esm');
  expect(existsSync(join(distDir, 'add.wasm'))).toBe(true);
});

test('wasm dynamic source phase: preserve + bundleless', async () => {
  const fixturePath = join(__dirname, 'dynamic-source-preserve-bundleless');
  const { contents } = await buildAndGetResults({ fixturePath });

  const { content: indexJs } = queryContent(contents.esm!, /index\.js/);
  const { content: utilsJs } = queryContent(contents.esm!, /utils\.js/);
  expect(indexJs).toMatch(/from\s*["']\.\/utils\.js["']/);
  expect(indexJs).not.toMatch(/\.wasm/);

  expect(utilsJs).toContain('createAdd');
  expect(utilsJs).toContain('import.source("./add.wasm")');

  const distDir = join(fixturePath, 'dist/esm');
  expect(existsSync(join(distDir, 'add.wasm'))).toBe(true);
});
