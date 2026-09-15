import { createRequire } from 'node:module';
import path from 'node:path';
import type { EnvironmentConfig, Rspack, RspackChain } from '@rsbuild/core';
import type { Format, Wasm, WasmMode } from '../types';
import { normalizeSlash } from '../utils/helper';
import { isWasmInlineRequest, WASM_INLINE_ISSUER_QUERY } from './inline';
import {
  createWasmPreserveExternal,
  wasmUntouchedExternal,
  WasmPreservePlugin,
} from './preserve';

const require = createRequire(import.meta.url);

const applyWasmInlineRule =
  (format: Format) =>
  (chain: RspackChain): void => {
    chain.module
      .rule('rslib-wasm-inline')
      .test(/\.wasm$/)
      .resourceQuery(/[?&]inline(?:&|=|$)/)
      .type('javascript/auto')
      .use('rslib-wasm-inline')
      .loader(require.resolve('./wasmInlineLoader.js'))
      .options({ format });
  };

export const resolveWasmMode = ({
  bundle,
  format,
  wasmConfig,
}: {
  bundle: boolean;
  format: Format;
  wasmConfig?: Wasm;
}): WasmMode | false => {
  if (wasmConfig !== undefined && format !== 'esm') {
    throw new Error(
      '"wasm" only supports the "esm" format. Set "format" to "esm" or omit it.',
    );
  }

  if (wasmConfig === false) {
    return false;
  }

  const mode = wasmConfig?.mode ?? (bundle ? 'compile' : 'preserve');

  if (bundle && mode === 'preserve') {
    throw new Error(
      'When using "wasm.mode: preserve", "bundle" must be set to "false". Use "wasm.mode: compile" to process WebAssembly in bundle mode.',
    );
  }

  return mode;
};

export const composeWasmConfig = ({
  bundle,
  format,
  jsDistPath,
  jsFilename,
  mode,
  outBase,
}: {
  bundle: boolean;
  format: Format;
  jsDistPath: string;
  jsFilename: Rspack.Filename;
  mode: WasmMode | false;
  outBase: string | null;
}): {
  externalConfig: EnvironmentConfig;
  config: EnvironmentConfig;
} => {
  const externals: Rspack.ExternalItem[] = [];
  const plugins: Rspack.RspackPluginInstance[] = [];
  const emitOptions = { jsDistPath, jsFilename, outBase: outBase! };

  if (!bundle && mode !== false) {
    plugins.push({
      apply(compiler) {
        compiler.hooks.normalModuleFactory.tap(
          'rslib-wasm-inline',
          (factory) => {
            factory.hooks.resolve.tap('rslib-wasm-inline', (data) => {
              if (!isWasmInlineRequest(data.request)) {
                return;
              }

              // Modern-module output extracts shared modules, so scope inline modules to their importer.
              const issuer = normalizeSlash(
                path.relative(outBase!, data.contextInfo.issuer),
              );
              data.request = data.request.replace(
                /(?=#|$)/,
                `&${WASM_INLINE_ISSUER_QUERY}=${encodeURIComponent(issuer)}`,
              );
            });
          },
        );
      },
    });
  }

  if (mode === false) {
    externals.push(wasmUntouchedExternal);
  }

  if (mode === 'preserve' && format === 'esm') {
    externals.push(createWasmPreserveExternal(emitOptions));
    plugins.push(new WasmPreservePlugin(outBase!));
  }

  return {
    externalConfig:
      externals.length > 0
        ? {
            output: {
              externals,
            },
          }
        : {},
    config: {
      tools: {
        ...(mode === false
          ? {}
          : { bundlerChain: applyWasmInlineRule(format) }),
        ...(plugins.length > 0 ? { rspack: { plugins } } : {}),
      },
    },
  };
};
