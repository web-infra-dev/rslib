import { createRequire } from 'node:module';
import type { EnvironmentConfig, Rspack, RspackChain } from '@rsbuild/core';
import type { Format, Wasm, WasmMode } from '../types';
import {
  createWasmInlineBundleless,
  createWasmInlineFormatGuardExternal,
} from './inlineBundleless';
import { createWasmPreserveExternal, WasmPreservePlugin } from './preserve';

const require = createRequire(import.meta.url);

// The loader returns JavaScript, so the rule overrides the module type `.wasm`
// would otherwise get. Installed for every format: without it the query is
// silently ignored and the import emits a separate `.wasm` asset.
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
}): WasmMode => {
  if (wasmConfig !== undefined && format !== 'esm') {
    throw new Error(
      '"wasm" only supports the "esm" format. Set "format" to "esm" or omit it.',
    );
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
  mode: WasmMode;
  outBase: string | null;
}): {
  externalConfig: EnvironmentConfig;
  config: EnvironmentConfig;
} => {
  const externals: Rspack.ExternalItem[] = [];
  const plugins: Rspack.RspackPluginInstance[] = [];
  const emitOptions = { jsDistPath, jsFilename, outBase: outBase! };

  if (!bundle) {
    // Bundleless externalizes the request before it can reach the loader, so
    // both inlining and the format rejection need their own external here.
    if (format === 'esm') {
      const inline = createWasmInlineBundleless(emitOptions);
      externals.push(inline.external);
      plugins.push(inline.plugin);
    } else {
      externals.push(createWasmInlineFormatGuardExternal(format));
    }
  }

  // `mode` falls back to "preserve" for every bundleless build, including
  // formats that cannot carry wasm at all.
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
        bundlerChain: applyWasmInlineRule(format),
        ...(plugins.length > 0 ? { rspack: { plugins } } : {}),
      },
    },
  };
};
