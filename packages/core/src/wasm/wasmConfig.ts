import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { EnvironmentConfig, RsbuildPlugin } from '@rsbuild/core';
import type { LibConfig, RsbuildConfigOutputTarget } from '../types';
import { DEFAULT_WASM_FILENAME } from './utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pluginWasm = ({
  target,
}: {
  target: RsbuildConfigOutputTarget;
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
          target: target === 'node' ? 'node' : 'web',
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
  format: LibConfig['format'];
  bundle: boolean;
}): EnvironmentConfig => {
  if (!wasm) {
    return {};
  }

  if (format !== 'esm') {
    throw new Error(
      'Rslib WASM support currently only works with ESM output. Use format: "esm".',
    );
  }

  if (!bundle) {
    throw new Error(
      'Rslib WASM support currently only works with bundle: true.',
    );
  }

  return {
    plugins: [pluginWasm({ target })],
  };
};
