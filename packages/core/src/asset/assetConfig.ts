import type { EnvironmentConfig, RsbuildPlugin } from '@rsbuild/core';
import type { Format } from '../types';
import { LibAssetExtractPlugin } from './LibAssetExtractPlugin';

const PLUGIN_NAME = 'rsbuild:lib-asset';

const RSBUILD_SVGR_PLUGIN_NAME = 'rsbuild:svgr';
const pluginLibAsset = ({ bundle }: { bundle: boolean }): RsbuildPlugin => ({
  name: PLUGIN_NAME,
  pre: [RSBUILD_SVGR_PLUGIN_NAME],
  setup(api) {
    api.modifyBundlerChain((config, { CHAIN_ID }) => {
      const isUsingSvgr = Boolean(
        config.module
          .rule(CHAIN_ID.RULE.SVG)
          .oneOf(CHAIN_ID.RULE.SVG)
          .uses.has(CHAIN_ID.USE.SVGR),
      );
      if (isUsingSvgr && !bundle) {
        // in bundleless, only support transform the svg asset to mixedImport svgr file
        // remove issuer to make every svg asset is transformed
        const rule = config.module
          .rule(CHAIN_ID.RULE.SVG)
          .oneOf(CHAIN_ID.ONE_OF.SVG);
        rule.issuer([]);
      }
      config
        .plugin(LibAssetExtractPlugin.name)
        .use(LibAssetExtractPlugin, [{ bundle, isUsingSvgr }]);

      if (bundle) {
        // preserve './' in css url
        // https://github.com/web-infra-dev/rspack/pull/8946
        config.plugins.get(CHAIN_ID.PLUGIN.MINI_CSS_EXTRACT)?.tap((options) => {
          if (bundle) {
            return [
              {
                ...options[0],
                enforceRelative: true,
              },
            ];
          }
          return options;
        });
      }
    });
  },
});

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
          assetPrefix: 'auto',
        },
        plugins: [pluginLibAsset({ bundle: true })],
      };
    }
    return {
      output: {
        dataUriLimit: 0, // default: no inline asset
        assetPrefix: 'auto',
      },
      plugins: [pluginLibAsset({ bundle: false })],
    };
  }

  // mf and umd etc
  return {};
};
