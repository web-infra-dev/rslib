export const WASM_INLINE_ISSUER_QUERY = '__rslib_wasm_inline_issuer';

export const isWasmInlineRequest = (request: string): boolean =>
  /^[^?#]*\.wasm\?(?:[^#]*&)?inline(?:&|=|#|$)/.test(request);

export const encodeWasmBinaryString = (bytes: Uint8Array): string => {
  let singleQuoteCount = 0;
  let doubleQuoteCount = 0;
  for (const byte of bytes) {
    if (byte === 0x27) singleQuoteCount++;
    if (byte === 0x22) doubleQuoteCount++;
  }
  const quote = singleQuoteCount < doubleQuoteCount ? "'" : '"';
  let encoded = quote;

  for (const byte of bytes) {
    const character = String.fromCharCode(byte);
    if (character === quote || character === '\\') {
      encoded += `\\${character}`;
    } else if (byte === 0x0a) {
      encoded += '\\n';
    } else if (byte === 0x0d) {
      encoded += '\\r';
    } else {
      encoded += character;
    }
  }

  return `${encoded}${quote}`;
};

export const generateWasmInlineModule = (
  bytes: Uint8Array,
  importer?: string,
): string => {
  const module = new WebAssembly.Module(bytes as Uint8Array<ArrayBuffer>);
  const imports = [
    ...new Set(WebAssembly.Module.imports(module).map(({ module }) => module)),
  ];
  const statements = imports.map((request, index) => {
    const dependency =
      importer === undefined
        ? request
        : request.replace(
            /(?=#|$)/,
            `${request.includes('?') ? '&' : '?'}${WASM_INLINE_ISSUER_QUERY}=${encodeURIComponent(importer)}`,
          );
    return `import * as __wasm_import_${index} from ${JSON.stringify(dependency)};`;
  });
  const importObject = imports
    .map(
      (request, index) =>
        `[${JSON.stringify(request)}]: __wasm_import_${index}`,
    )
    .join(', ');

  statements.push(
    `const __wasm_bytes = Uint8Array.from(${encodeWasmBinaryString(bytes)}, c => (c = c.charCodeAt(0), ~c >> 8 & c));`,
    `const { instance: __wasm_instance } = await WebAssembly.instantiate(__wasm_bytes, {${importObject}});`,
    'const __wasm_exports = __wasm_instance.exports;',
    'export default __wasm_exports;',
  );

  WebAssembly.Module.exports(module).forEach(({ name }, index) => {
    if (name === 'default') return;
    const exportName = /^[$A-Z_a-z][$\w]*$/.test(name)
      ? name
      : JSON.stringify(name);
    statements.push(
      `const __wasm_export_${index} = __wasm_exports[${JSON.stringify(name)}];`,
      `export { __wasm_export_${index} as ${exportName} };`,
    );
  });

  return `${statements.join('\n')}\n`;
};
