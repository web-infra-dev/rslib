import path from 'node:path';
import type { Rspack } from '@rsbuild/core';
import {
  createExportsSource,
  createImportsObjectSource,
  DEFAULT_WASM_FILENAME,
  toJsString,
} from './utils';

export type RawWasmLoaderOptions = {
  format: 'esm' | 'cjs';
  target: 'web' | 'node';
};

const createEsmNodeFacade = (
  emittedPath: string,
  imports: WebAssembly.ModuleImportDescriptor[],
  exportsList: WebAssembly.ModuleExportDescriptor[],
): string => `import { readFile as __rslib_readFile } from 'node:fs/promises';

const __rslib_wasm_url = new URL(/* webpackIgnore: true */ ${toJsString(emittedPath)}, import.meta.url);
const __rslib_wasm_bytes = await __rslib_readFile(__rslib_wasm_url);
${createImportsObjectSource(imports)};
const { instance: __rslib_wasm_instance } = await WebAssembly.instantiate(
  __rslib_wasm_bytes,
  __rslib_wasm_imports,
);
${createExportsSource(exportsList)}
`;

const createEsmWebFacade = (
  emittedPath: string,
  imports: WebAssembly.ModuleImportDescriptor[],
  exportsList: WebAssembly.ModuleExportDescriptor[],
): string => `const __rslib_wasm_url = new URL(/* webpackIgnore: true */ ${toJsString(emittedPath)}, import.meta.url);
const __rslib_wasm_response = await fetch(__rslib_wasm_url);
${createImportsObjectSource(imports)};
const { instance: __rslib_wasm_instance } = await WebAssembly.instantiateStreaming(
  __rslib_wasm_response,
  __rslib_wasm_imports,
);
${createExportsSource(exportsList)}
`;

const createCjsNodeFacade = (
  emittedPath: string,
  imports: WebAssembly.ModuleImportDescriptor[],
): string => `'use strict';

const __rslib_fs = require('node:fs');
const __rslib_path = require('node:path');

const __rslib_wasm_path = __rslib_path.join(__dirname, ${toJsString(
  emittedPath,
)});
const __rslib_wasm_bytes = __rslib_fs.readFileSync(__rslib_wasm_path);
${createImportsObjectSource(imports)};
const __rslib_wasm_module = new WebAssembly.Module(__rslib_wasm_bytes);
const __rslib_wasm_instance = new WebAssembly.Instance(
  __rslib_wasm_module,
  __rslib_wasm_imports,
);

module.exports = __rslib_wasm_instance.exports;
module.exports.default = __rslib_wasm_instance.exports;
`;

const toRelativeAssetUrl = (emittedPath: string): string =>
  emittedPath.startsWith('./') || emittedPath.startsWith('../')
    ? emittedPath
    : `./${emittedPath}`;

const createFacade = ({
  format,
  target,
  emittedPath,
  imports,
  exportsList,
}: {
  format: 'esm' | 'cjs';
  target: 'web' | 'node';
  emittedPath: string;
  imports: WebAssembly.ModuleImportDescriptor[];
  exportsList: WebAssembly.ModuleExportDescriptor[];
}): string => {
  if (format === 'cjs') {
    return createCjsNodeFacade(emittedPath, imports);
  }

  return target === 'node'
    ? createEsmNodeFacade(emittedPath, imports, exportsList)
    : createEsmWebFacade(emittedPath, imports, exportsList);
};

const loader: Rspack.LoaderDefinition<RawWasmLoaderOptions> = async function (
  content,
) {
  const options = this.getOptions();
  const bytes = Buffer.isBuffer(content)
    ? content
    : Buffer.from(content);
  const wasmBytes = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
  const wasmModule = await WebAssembly.compile(wasmBytes);
  const imports = WebAssembly.Module.imports(wasmModule);
  const exportsList = WebAssembly.Module.exports(wasmModule);
  const fileName = DEFAULT_WASM_FILENAME
    .replace('[name]', path.basename(this.resourcePath, path.extname(this.resourcePath)))
    .replace(
      '[contenthash:8]',
      this.utils.createHash('xxhash64').update(bytes).digest('hex').slice(0, 8),
    )
    .replace('[ext]', path.extname(this.resourcePath));
  const assetUrl = toRelativeAssetUrl(fileName);

  this.emitFile(fileName, bytes);

  return createFacade({
    format: options.format,
    target: options.target,
    emittedPath: assetUrl,
    imports,
    exportsList,
  });
};

export const raw = true;

export default loader;
