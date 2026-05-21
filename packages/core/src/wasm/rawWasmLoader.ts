import path from 'node:path';
import type { Rspack } from '@rsbuild/core';
import {
  createExportsSource,
  createImportsObjectSource,
  DEFAULT_WASM_FILENAME,
  toJsString,
} from './utils';

export type RawWasmLoaderOptions = {
  target: 'web' | 'node';
};

const createNodeFacade = (
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

const toRelativeAssetUrl = (emittedPath: string): string =>
  emittedPath.startsWith('./') || emittedPath.startsWith('../')
    ? emittedPath
    : `./${emittedPath}`;

const createWebFacade = (
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

  const facade =
    options.target === 'node'
      ? createNodeFacade(assetUrl, imports, exportsList)
      : createWebFacade(assetUrl, imports, exportsList);

  return facade;
};

export const raw = true;

export default loader;
