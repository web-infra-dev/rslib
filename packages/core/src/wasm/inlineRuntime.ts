/**
 * Shared decoder for inlined wasm binaries.
 *
 * The binary is embedded as a byte string, one byte per string code unit.
 * `charCodeAt` recovers it without `Buffer` or `atob`, so node, web and neutral
 * targets share this module. Keeping it a real module lets every
 * `.wasm?inline` import the same decoder instead of carrying its own copy.
 *
 * Bundleless copies this file into dist verbatim, so it never passes through
 * the consuming library's SWC transform — hence a plain function declaration.
 */
export function decodeWasmByteString(value: string): Uint8Array {
  const bytes = new Uint8Array(value.length);
  for (let index = 0; index < value.length; index++) {
    bytes[index] = value.charCodeAt(index);
  }
  return bytes;
}
