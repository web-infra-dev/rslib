import { runInNewContext } from 'node:vm';
import { describe, expect, test } from '@rstest/core';
import {
  encodeWasmByteString,
  generateWasmInlineModule,
} from '../src/wasm/inline';

const ADD_WASM = Uint8Array.from([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x07, 0x01, 0x60, 0x02,
  0x7f, 0x7f, 0x01, 0x7f, 0x03, 0x02, 0x01, 0x00, 0x07, 0x07, 0x01, 0x03, 0x61,
  0x64, 0x64, 0x00, 0x00, 0x0a, 0x09, 0x01, 0x07, 0x00, 0x20, 0x00, 0x20, 0x01,
  0x6a, 0x0b,
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

const RUNTIME = './rslib-wasm-runtime.js';

describe('wasm inline code generation', () => {
  test('round trips every byte through byte-string encoding', () => {
    const bytes = Uint8Array.from({ length: 256 }, (_, index) => index);
    const literal = encodeWasmByteString(bytes);
    const decoded = runInNewContext(literal) as string;

    expect(
      Uint8Array.from(decoded, (character) => character.charCodeAt(0)),
    ).toEqual(bytes);
  });

  test('generates an async module with reflected exports', () => {
    const code = generateWasmInlineModule({
      bytes: ADD_WASM,
      runtimeRequest: RUNTIME,
    });

    expect(code).toContain('await WebAssembly.instantiate');
    expect(code).toContain('__decodeWasmByteString(');
    expect(code).toContain('export default __wasm_exports');
    expect(code).toContain('as add');
  });

  test('imports the decoder from the shared runtime instead of inlining it', () => {
    const code = generateWasmInlineModule({
      bytes: ADD_WASM,
      runtimeRequest: RUNTIME,
    });

    expect(code).toContain(
      `import { decodeWasmByteString as __decodeWasmByteString } from "${RUNTIME}";`,
    );
    expect(code).not.toContain('charCodeAt');
    expect(code).not.toContain('Buffer.from');
    expect(code).not.toContain('atob(');
  });

  test('lifts WebAssembly imports into ESM namespace imports', () => {
    const code = generateWasmInlineModule({
      bytes: IMPORTING_WASM,
      runtimeRequest: RUNTIME,
    });

    expect(code).toContain('import * as __wasm_import_0 from "./meta.js";');
    expect(code).toContain('"./meta.js": __wasm_import_0');
    expect(code).toContain('as read');
  });
});
