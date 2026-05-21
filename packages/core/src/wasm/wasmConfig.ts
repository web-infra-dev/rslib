import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { EnvironmentConfig, RsbuildPlugin } from '@rsbuild/core';
import type {
  Format,
  RsbuildConfigOutputTarget,
} from '../types';
import { DEFAULT_WASM_FILENAME } from './utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type SupportedWasmFormat = 'esm' | 'cjs';
type SupportedWasmTarget = 'web' | 'node';

const normalizeWasmTarget = (
  target: RsbuildConfigOutputTarget,
): SupportedWasmTarget => (target === 'node' ? 'node' : 'web');

const assertWasmSupport = ({
  format,
  target,
  bundle,
}: {
  format: Format;
  target: RsbuildConfigOutputTarget;
  bundle: boolean;
}): {
  format: SupportedWasmFormat;
  target: SupportedWasmTarget;
} => {
  if (!bundle) {
    throw new Error(
      'Rslib WASM support currently only works with bundle: true.',
    );
  }

  if (format !== 'esm' && format !== 'cjs') {
    throw new Error(
      `Rslib WASM support does not support format "${format}" yet.`,
    );
  }

  const normalizedTarget = normalizeWasmTarget(target);

  if (format === 'cjs' && normalizedTarget !== 'node') {
    throw new Error(
      'Rslib WASM support currently only supports CJS output when target is "node".',
    );
  }

  return {
    format,
    target: normalizedTarget,
  };
};

const pluginWasm = ({
  format,
  target,
}: {
  format: SupportedWasmFormat;
  target: SupportedWasmTarget;
}): RsbuildPlugin => ({
  name: 'rslib:wasm',
  setup(api) {
    api.modifyBundlerChain((config, { CHAIN_ID }) => {
      if (CHAIN_ID.RULE.WASM && config.module.rules.has(CHAIN_ID.RULE.WASM)) {
        config.module.rules.delete(CHAIN_ID.RULE.WASM);
      }

      config.module
        .rule('rslib-wasm')
        .test(/\.wasm$/)
        .type('javascript/auto')
        .use('rslib-raw-wasm')
        .loader(path.join(__dirname, 'rawWasmLoader.js'))
        .options({
          format,
          target,
        });

      config.output.merge({
        webassemblyModuleFilename: DEFAULT_WASM_FILENAME,
      });
    });
  },
});

export const composeWasmConfig = ({
  wasm,
  target,
  format,
  bundle,
}: {
  wasm: boolean | undefined;
  target: RsbuildConfigOutputTarget;
  format: Format;
  bundle: boolean;
}): EnvironmentConfig => {
  if (!wasm) {
    return {};
  }

  const resolved = assertWasmSupport({
    format,
    target,
    bundle,
  });

  return {
    plugins: [pluginWasm(resolved)],
  };
};
