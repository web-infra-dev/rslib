import type { Rspack } from '@rsbuild/core';
import type { Format } from '../types';
import {
  generateWasmInlineModule,
  WASM_INLINE_ISSUER_QUERY,
} from './inline.js';

function wasmInlineLoader(
  this: Rspack.LoaderContext<{ format: Format }>,
  content: Buffer,
): string {
  const { format } = this.getOptions();
  if (format !== 'esm') {
    throw new Error(
      `Importing wasm with the "?inline" query only supports the "esm" format, but the current format is "${format}".`,
    );
  }

  return generateWasmInlineModule(
    content,
    new URLSearchParams(this.resourceQuery).get(WASM_INLINE_ISSUER_QUERY) ??
      undefined,
  );
}

// ESM loaders expose raw mode as a named export to avoid UTF-8 decoding binary input.
export const raw = true;

export default wasmInlineLoader;
