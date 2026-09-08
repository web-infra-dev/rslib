import { createRequire } from 'node:module';
import type { Rspack } from '@rsbuild/core';
import type { Format } from '../types';
import { generateWasmInlineModule } from './inline.js';

const require = createRequire(import.meta.url);

// Every inlined binary imports this one module, so the bundler emits a single
// copy of the decoder no matter how many `.wasm?inline` files a bundle holds.
const resolveRuntimePath = (): string =>
  require.resolve('./wasmInlineRuntime.js');

// Rspack's `LoaderDefinition` models `raw?: false` only, so a raw loader
// annotates its own context and `Buffer` content instead.
function wasmInlineLoader(
  this: Rspack.LoaderContext<{ format: Format }>,
  content: Buffer,
): string {
  const { format } = this.getOptions();

  // `?inline` is driven by the import specifier rather than by config, so an
  // unsupported format can only be reported once such an import is seen.
  if (format !== 'esm') {
    throw new Error(
      `Importing wasm with the "?inline" query only supports the "esm" format, but the current format is "${format}". Set "format" to "esm", or import ${this.resourcePath} without the "?inline" query.`,
    );
  }

  try {
    return generateWasmInlineModule({
      bytes: content,
      runtimeRequest: resolveRuntimePath(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to inline ${this.resourcePath}: ${message}`);
  }
}

// `raw` must be a named export: an ESM loader's flag is read off the module
// namespace, so setting it as a property on the default export is ignored and
// the loader silently receives a UTF-8 decoded string instead of the binary.
export const raw = true;

export default wasmInlineLoader;
