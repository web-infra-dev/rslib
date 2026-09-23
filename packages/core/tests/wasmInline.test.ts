import { runInNewContext } from 'node:vm';
import { describe, expect, test } from '@rstest/core';
import {
  encodeWasmBinaryString,
  generateWasmInlineModule,
  isWasmInlineRequest,
} from '../src/wasm/inline';

const ADD_WASM = Uint8Array.from([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x07, 0x01, 0x60, 0x02,
  0x7f, 0x7f, 0x01, 0x7f, 0x03, 0x02, 0x01, 0x00, 0x07, 0x07, 0x01, 0x03, 0x61,
  0x64, 0x64, 0x00, 0x00, 0x0a, 0x09, 0x01, 0x07, 0x00, 0x20, 0x00, 0x20, 0x01,
  0x6a, 0x0b,
]);

const DEFAULT_WASM = Uint8Array.from([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x07, 0x01, 0x60, 0x02,
  0x7f, 0x7f, 0x01, 0x7f, 0x03, 0x02, 0x01, 0x00, 0x07, 0x0b, 0x01, 0x07, 0x64,
  0x65, 0x66, 0x61, 0x75, 0x6c, 0x74, 0x00, 0x00, 0x0a, 0x09, 0x01, 0x07, 0x00,
  0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b,
]);

const IMPORTING_WASM = Uint8Array.from([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
  // (type (func (result i32)))
  0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7f,
  // (import "./meta.js" "now" (func (type 0)))
  0x02, 0x11, 0x01, 0x09, 0x2e, 0x2f, 0x6d, 0x65, 0x74, 0x61, 0x2e, 0x6a, 0x73,
  0x03, 0x6e, 0x6f, 0x77, 0x00, 0x00,
  // (func (type 0))
  0x03, 0x02, 0x01, 0x00,
  // (export "read" (func 1))
  0x07, 0x08, 0x01, 0x04, 0x72, 0x65, 0x61, 0x64, 0x00, 0x01,
  // (func (result i32) call 0)
  0x0a, 0x06, 0x01, 0x04, 0x00, 0x10, 0x00, 0x0b,
]);

describe('wasm inline requests', () => {
  test.each([
    './add.wasm?inline',
    './add.wasm?inline=true',
    './add.wasm?inline#fragment',
    './add.wasm?inline&other',
    './add.wasm?other&inline',
    './add.wasm?other=1&inline=true&extra=2',
  ])('matches %s', (request) => {
    expect(isWasmInlineRequest(request)).toBe(true);
  });

  test.each([
    './add.wasm',
    './add.wasm?not-inline',
    './add.wasm?inlined',
    './add.wasm?other=inline',
    './add.wasm?other=#inline',
    './add.wasm#inline',
    './add.wasm?other#fragment&inline',
    './index.js?inline',
    './index.js?file=add.wasm?inline',
  ])('does not match %s', (request) => {
    expect(isWasmInlineRequest(request)).toBe(false);
  });
});

describe('wasm inline code generation', () => {
  test('round trips every byte through UTF-8 binary encoding', () => {
    const bytes = Uint8Array.from({ length: 256 }, (_, index) => index);
    const literal = encodeWasmBinaryString(bytes);
    const decoded = runInNewContext(
      `Uint8Array.from(${literal}, c => (c = c.charCodeAt(0), ~c >> 8 & c))`,
    ) as Uint8Array;

    expect(Array.from(decoded)).toEqual(Array.from(bytes));
  });

  test('is smaller than base64 for a typical wasm binary', () => {
    const encodedSize = Buffer.byteLength(encodeWasmBinaryString(ADD_WASM));
    const base64Size = Buffer.from(ADD_WASM).toString('base64').length;

    expect(encodedSize).toBeLessThan(base64Size);
  });

  test('generates an async module with reflected exports', () => {
    const code = generateWasmInlineModule(ADD_WASM);

    expect(code).toContain('await WebAssembly.instantiate');
    expect(code).toContain('Uint8Array.from(');
    expect(code).not.toContain('export default');
    expect(code).toContain('as add');
  });

  test('runs the generated module without a runtime dependency', async () => {
    const code = generateWasmInlineModule(ADD_WASM);
    const output = await import(
      `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
    );
    expect(output.add(20, 22)).toBe(42);
    expect(output).not.toHaveProperty('default');
  });

  test('preserves a default export declared by the WebAssembly module', async () => {
    const code = generateWasmInlineModule(DEFAULT_WASM);
    const output = await import(
      `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
    );

    expect(output.default(20, 22)).toBe(42);
  });

  test('rejects an invalid binary during code generation', () => {
    expect(() => generateWasmInlineModule(new Uint8Array())).toThrow();
  });

  test('lifts WebAssembly imports into ESM namespace imports', () => {
    const code = generateWasmInlineModule(IMPORTING_WASM);

    expect(code).toContain('import * as __wasm_import_0 from "./meta.js";');
    expect(code).toContain('["./meta.js"]: __wasm_import_0');
    expect(code).toContain('as read');
  });
});
