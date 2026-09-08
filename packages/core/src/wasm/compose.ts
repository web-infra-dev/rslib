import { createRequire } from 'node:module';
import type { EnvironmentConfig, Rspack, RspackChain } from '@rsbuild/core';
import type { Format, Wasm, WasmMode } from '../types';
import { createWasmInlineBundleless } from './inlineBundleless';
import { createWasmPreserveExternal, WasmPreservePlugin } from './preserve';

const require = createRequire(import.meta.url);

// The loader returns JavaScript, so the rule has to override the module type
// `.wasm` would otherwise get, whether that is `webassembly/async` or an asset.
// Rules are applied in order, so appending this one lets its type win.
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

  // `?inline` is driven by the import specifier alone, so its handling is never
  // gated behind a config option. The rule is installed for every format so
  // that an unsupported one fails with a dedicated error; without it the query
  // is silently ignored and the import emits a separate `.wasm` asset instead.
  const bundlerChain = applyWasmInlineRule(format);

  if (format !== 'esm') {
    return { externalConfig: {}, config: { tools: { bundlerChain } } };
  }

  if (!bundle) {
    const bundlelessInline = createWasmInlineBundleless({
      jsDistPath,
      jsFilename,
      outBase: outBase!,
    });
    externals.push(bundlelessInline.external);
    plugins.push(bundlelessInline.plugin);
  }

  if (mode === 'preserve') {
    const preserveOptions = {
      jsDistPath,
      jsFilename,
      outBase: outBase!,
    };
    externals.push(createWasmPreserveExternal(preserveOptions));
    plugins.push(new WasmPreservePlugin(preserveOptions.outBase));
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
        bundlerChain,
        ...(plugins.length > 0 ? { rspack: { plugins } } : {}),
      },
    },
  };
};
