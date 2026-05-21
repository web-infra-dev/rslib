export const DEFAULT_WASM_FILENAME =
  'static/wasm/[name].[contenthash:8][ext]';

export const toJsString = (value: string): string => JSON.stringify(value);

export const normalizeExportName = (name: string): string =>
  /^[$A-Z_a-z][$\w]*$/.test(name) ? name : JSON.stringify(name);

export const createImportsObjectSource = (
  imports: WebAssembly.ModuleImportDescriptor[],
): string => {
  if (imports.length > 0) {
    throw new Error(
      'WebAssembly modules with non-empty imports are not supported in the first phase of Rslib WASM support.',
    );
  }

  return 'const __rslib_wasm_imports = {}';
};

export const createExportsSource = (
  exportsList: WebAssembly.ModuleExportDescriptor[],
): string => {
  const lines: string[] = [];

  for (const item of exportsList) {
    if (item.kind !== 'function') {
      continue;
    }

    const exportName = item.name;
    const localName = /^[$A-Z_a-z][$\w]*$/.test(exportName)
      ? exportName
      : `__rslib_wasm_export_${lines.length}`;

    lines.push(
      `const ${localName} = __rslib_wasm_instance.exports[${toJsString(exportName)}];`,
    );

    if (localName === exportName) {
      lines.push(`export { ${localName} };`);
    } else {
      lines.push(`export { ${localName} as ${normalizeExportName(exportName)} };`);
    }
  }

  lines.push('export default __rslib_wasm_instance.exports;');

  return lines.join('\n');
};
