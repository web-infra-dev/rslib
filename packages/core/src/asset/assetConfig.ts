import type { EnvironmentConfig } from '@rsbuild/core';
import type { Format } from '../types';
import { LibAssetExtractPlugin } from './LibAssetExtractPlugin';

// TODO: asset config document
export const composeAssetConfig = (
  bundle: boolean,
  format: Format,
): EnvironmentConfig => {
  if (format === 'esm' || format === 'cjs') {
    if (bundle) {
      return {
        output: {
          dataUriLimit: 0, // default: no inline asset
          assetPrefix: 'auto', // TODO: will turn on this with js support together in the future
        },
        tools: {
          rspack: {
            plugins: [new LibAssetExtractPlugin()]
          
          },
        },
      };
    }
    // TODO: bundleless
    return {
      output: {
        dataUriLimit: 0, // default: no inline asset
        assetPrefix: 'auto',
      },
      tools: {
        rspack: {
          plugins: [new LibAssetExtractPlugin()]
        
        },
      },
    };
  }

  // mf and umd etc
  return {};
};
