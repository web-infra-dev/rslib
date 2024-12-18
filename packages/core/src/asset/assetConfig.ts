import type { RsbuildConfig } from '@rsbuild/core';
import type { Format } from '../types';

export const composeAssetConfig = (
  bundle: boolean,
  format: Format,
): RsbuildConfig => {
  if (format === 'esm' || format === 'cjs') {
    if (bundle) {
      return {
        output: {
          // default: no inline asset
          dataUriLimit: 0,
          assetPrefix: 'auto', // we currently not support import asset in js because of 'auto' publicPath runtime
        },
      };
    }
    // TODO: bundleless
    return {};
  }

  // mf and umd etc
  return {};
};
