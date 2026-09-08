type WasmExportDescriptor = {
  name: string;
};

type WasmImportDescriptor = {
  module: string;
};

const isIdentifierName = (value: string): boolean =>
  /^[$A-Z_a-z][$\w]*$/.test(value);

const renderExportName = (value: string): string =>
  isIdentifierName(value) ? value : JSON.stringify(value);

const toHexEscape = (byte: number): string =>
  `\\x${byte.toString(16).padStart(2, '0')}`;

export const encodeWasmByteString = (bytes: Uint8Array): string => {
  let encoded = '';

  for (const byte of bytes) {
    if (byte >= 0x20 && byte <= 0x7e) {
      const character = String.fromCharCode(byte);
      encoded +=
        character === '\\' || character === "'" ? `\\${character}` : character;
    } else {
      encoded += toHexEscape(byte);
    }
  }

  return `'${encoded}'`;
};

const renderGeneratedModule = ({
  bytes,
  exports,
  imports,
  runtimeRequest,
}: {
  bytes: Uint8Array;
  exports: WasmExportDescriptor[];
  imports: WasmImportDescriptor[];
  runtimeRequest: string;
}): string => {
  const importModules = [...new Set(imports.map((item) => item.module))];
  const statements: string[] = importModules.map(
    (request, index) =>
      `import * as __wasm_import_${index} from ${JSON.stringify(request)};`,
  );

  statements.push(
    `import { decodeWasmByteString as __decodeWasmByteString } from ${JSON.stringify(runtimeRequest)};`,
    `const __wasm_bytes = __decodeWasmByteString(${encodeWasmByteString(bytes)});`,
  );

  const importObject =
    importModules.length === 0
      ? '{}'
      : `{\n${importModules
          .map(
            (request, index) =>
              `  ${JSON.stringify(request)}: __wasm_import_${index},`,
          )
          .join('\n')}\n}`;

  statements.push(
    `const { instance: __wasm_instance } = await WebAssembly.instantiate(__wasm_bytes, ${importObject});`,
    'const __wasm_exports = __wasm_instance.exports;',
    'export default __wasm_exports;',
  );

  exports.forEach((item, index) => {
    if (item.name === 'default') return;
    statements.push(
      `const __wasm_export_${index} = __wasm_exports[${JSON.stringify(item.name)}];`,
      `export { __wasm_export_${index} as ${renderExportName(item.name)} };`,
    );
  });

  return `${statements.join('\n\n')}\n`;
};

const inspectWasmModule = (
  bytes: Uint8Array,
): {
  exports: WasmExportDescriptor[];
  imports: WasmImportDescriptor[];
} => {
  const module = new WebAssembly.Module(bytes as unknown as BufferSource);
  return {
    exports: WebAssembly.Module.exports(module),
    imports: WebAssembly.Module.imports(module),
  };
};

export const generateWasmInlineModule = ({
  bytes,
  runtimeRequest,
}: {
  bytes: Uint8Array;
  runtimeRequest: string;
}): string =>
  renderGeneratedModule({
    bytes,
    ...inspectWasmModule(bytes),
    runtimeRequest,
  });
