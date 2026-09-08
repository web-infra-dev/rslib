import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { stripVTControlCharacters as stripAnsi } from 'node:util';
import { beforeAll, describe, expect, test } from '@rstest/core';
import { buildAndGetResults, proxyConsole } from 'test-helper';

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });

const loadOutput = async (fixturePath: string, variant: string) => {
  const entry = join(fixturePath, 'dist', variant, 'index.js');
  return import(`${pathToFileURL(entry).href}?variant=${variant}`);
};

describe('wasm inline', () => {
  const fixturePath = join(__dirname, 'basic');

  beforeAll(async () => {
    await buildAndGetResults({ fixturePath });
  });

  test.each(['bundle', 'bundleless'])(
    'runs the %s output without a wasm asset',
    async (variant) => {
      const output = await loadOutput(fixturePath, variant);
      expect(output.useAdd(20, 22)).toBe(42);
      expect(output.useNamedAdd(20, 22)).toBe(42);
      expect(
        walk(join(fixturePath, 'dist', variant)).some((file) =>
          file.endsWith('.wasm'),
        ),
      ).toBe(false);
    },
  );

  test('inlines as a byte string in bundle mode', () => {
    const dist = join(fixturePath, 'dist/bundle');
    const code = readFileSync(join(dist, 'index.js'), 'utf8');
    expect(code).toContain('charCodeAt');
    expect(code).not.toContain('Buffer.from');
    expect(code).not.toContain('atob(');
  });

  test('emits a shared runtime in bundleless mode', () => {
    const dist = join(fixturePath, 'dist/bundleless');
    expect(existsSync(join(dist, 'add.js'))).toBe(true);
    expect(existsSync(join(dist, 'rslib-wasm-runtime.js'))).toBe(true);
    expect(readFileSync(join(dist, 'add.js'), 'utf8')).toContain(
      'decodeWasmByteString',
    );
    expect(readFileSync(join(dist, 'index.js'), 'utf8')).toContain('./add.js');
  });

  // Rslib deliberately generates no declarations for `?inline`. Users describe
  // their own binaries with a wildcard ambient module and narrow them behind a
  // wrapper, which keeps the `?inline` specifier out of the published d.ts.
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

  test('fails with a dedicated error when the format is not "esm"', async () => {
    const { logs, restore } = proxyConsole();
    const build = buildAndGetResults({ fixturePath: join(__dirname, 'cjs') });

    await expect(build).rejects.toThrowError('Rspack build failed.');
    expect(logs.map((log) => stripAnsi(log)).join('\n')).toContain(
      'Importing wasm with the "?inline" query only supports the "esm" format',
    );
    restore();
  });
});
