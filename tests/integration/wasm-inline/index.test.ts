import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { stripVTControlCharacters as stripAnsi } from 'node:util';
import { beforeAll, describe, expect, test } from '@rstest/core';
import { buildAndGetResults, proxyConsole } from 'test-helper';

const loadOutput = async (fixturePath: string, variant: string) => {
  const entry = join(fixturePath, 'dist', variant, 'index.js');
  return import(`${pathToFileURL(entry).href}?variant=${variant}`);
};

describe('wasm inline', () => {
  const fixturePath = join(__dirname, 'basic');

  beforeAll(async () => {
    await buildAndGetResults({ fixturePath });
  });

  test.each(['bundle', 'bundleless', 'bundleless-compile'])(
    'runs the %s output without a wasm asset',
    async (variant) => {
      const output = await loadOutput(fixturePath, variant);
      expect(output.useAdd(20, 22)).toBe(42);
      expect(output.otherAdd(20, 22)).toBe(42);
      expect(output.useNamedAdd(20, 22)).toBe(42);
      expect(output.read()).toBe(42);
      expect(
        readdirSync(join(fixturePath, 'dist', variant), {
          recursive: true,
          encoding: 'utf8',
        }).some((file) => file.endsWith('.wasm')),
      ).toBe(false);
    },
  );

  test('inlines as a UTF-8 binary string in bundle mode', () => {
    const dist = join(fixturePath, 'dist/bundle');
    const output = readFileSync(join(dist, 'index.js'));
    const code = output.toString('utf8');
    expect(code).toContain('charCodeAt');
    expect(output.includes(0)).toBe(true);
    expect(output.some((byte) => byte >= 0x80)).toBe(true);
    expect(code).not.toMatch(/\\x[0-9a-f]{2}/i);
    expect(code).not.toContain('Buffer.from');
    expect(code).not.toContain('atob(');
  });

  test.each(['bundleless', 'bundleless-compile'])(
    'inlines wasm and its decoder into each importing file (%s)',
    async (variant) => {
      const dist = join(fixturePath, 'dist', variant);
      expect(readdirSync(dist).sort()).toEqual([
        'index.js',
        'named.js',
        'nested',
      ]);
      expect(readdirSync(join(dist, 'nested'))).toEqual(['meta.js']);
      for (const file of ['index.js', 'named.js']) {
        const code = readFileSync(join(dist, file), 'utf8');
        const binaryCount = file === 'index.js' ? 3 : 1;
        expect(code.match(/WebAssembly\.instantiate/g)).toHaveLength(
          binaryCount,
        );
        expect(code.match(/charCodeAt/g)).toHaveLength(binaryCount);
        expect(code).not.toContain('?inline');
        expect(code).not.toContain(fixturePath);
        expect(code).not.toContain('wasmInlineRuntime');
        expect(code).not.toContain('rslib-wasm-runtime');
        expect(code).not.toContain('Buffer.from');
        expect(code).not.toContain('atob(');
      }
      expect(readFileSync(join(dist, 'index.js'), 'utf8')).toContain(
        './named.js',
      );

      const output = await loadOutput(fixturePath, variant);
      const named = await import(pathToFileURL(join(dist, 'named.js')).href);
      expect(named.useNamedAdd(20, 22)).toBe(42);
      expect(output.add).not.toBe(named.add);
    },
  );

  test.each(['bundle-disabled', 'bundleless-disabled'])(
    'keeps inline imports untouched when wasm is disabled (%s)',
    (variant) => {
      const dist = join(fixturePath, 'dist', variant);
      const files = readdirSync(dist, { recursive: true, encoding: 'utf8' });
      expect(files.some((file) => file.endsWith('.wasm'))).toBe(false);

      const code = readFileSync(join(dist, 'index.js'), 'utf8');
      expect(code).toContain('./add.wasm?inline');
      expect(code).toContain('./nested/read.wasm?inline');
      expect(code).not.toContain('WebAssembly.instantiate');
      expect(code).not.toContain('__rslib_wasm_inline_issuer');
    },
  );

  test('keeps explicit externals ahead of inline handling', () => {
    const dist = join(fixturePath, 'dist/bundleless-external');
    const code = readFileSync(join(dist, 'named.js'), 'utf8');
    expect(code).toContain('./external.wasm');
    expect(code).not.toContain('WebAssembly.instantiate');
    expect(code).not.toContain('__rslib_wasm_inline_issuer');
  });

  test('lets users declare their own types without leaking the query', async () => {
    const typedFixture = join(__dirname, 'typed');
    await buildAndGetResults({ fixturePath: typedFixture });

    const dist = join(typedFixture, 'dist/bundleless');
    const dts = readFileSync(join(dist, 'index.d.ts'), 'utf8');
    expect(dts).not.toContain('?inline');
    expect(dts).toContain('export declare const useAdd');

    const output = await import(
      `${pathToFileURL(join(dist, 'index.js')).href}?variant=typed`
    );
    expect(output.useAdd(20, 22)).toBe(42);
  });

  test.each(['bundle', 'bundleless'])(
    'rejects inline wasm in CJS (%s)',
    async (lib) => {
      const { logs, restore } = proxyConsole();
      const build = buildAndGetResults({
        fixturePath: join(__dirname, 'cjs'),
        lib: [lib],
      });

      await expect(build).rejects.toThrow('Rspack build failed.');
      expect(logs.map((log) => stripAnsi(log)).join('\n')).toContain(
        'WASM imports with "?inline" require the "esm" format',
      );
      restore();
    },
  );
});
