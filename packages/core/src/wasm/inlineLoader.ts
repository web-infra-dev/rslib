import type { Rspack } from '@rsbuild/core';
import type { Format } from '../types';
import {
  generateWasmInlineModule,
  generateWasmSourceModule,
  WASM_INLINE_ISSUER_QUERY,
} from './inline.js';

function wasmInlineLoader(
  this: Rspack.LoaderContext<{
    format: Format;
    phase: 'evaluation' | 'source';
  }>,
  content: Buffer,
): string {
  const { format, phase } = this.getOptions();
  if (format !== 'esm') {
    throw new Error(
      `WASM imports with "?inline" require the "esm" format, but the current format is "${format}".`,
    );
  }

  if (phase === 'source') {
    return generateWasmSourceModule(content);
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
