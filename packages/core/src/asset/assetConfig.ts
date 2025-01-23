import type { EnvironmentConfig, RsbuildPlugin } from '@rsbuild/core';
import { CSS_EXTENSIONS_PATTERN } from '../constant';
import type { Format } from '../types';
import {
  LibSvgrPatchPlugin,
  PUBLIC_PATH_PLACEHOLDER,
} from './LibSvgrPatchPlugin';

const PLUGIN_NAME = 'rsbuild:lib-asset';

const RSBUILD_SVGR_PLUGIN_NAME = 'rsbuild:svgr';

/**
 * Be compatible to css-extract importModule and experimentalLibPreserveExports
 * when set experimentalLibPreserveExports to true, the css-loader result can not executed in node side, so clone the assets rule
 * 1. js assets: original rule set issuer and experimentalLibPreserveExports: true
 * 2. css assets: a copy of original rule
 */
const pluginLibAsset = ({ bundle }: { bundle: boolean }): RsbuildPlugin => ({
  name: PLUGIN_NAME,
  pre: [RSBUILD_SVGR_PLUGIN_NAME],
  setup(api) {
    api.modifyBundlerChain((config, { CHAIN_ID }) => {
      // 1. modify svg rule first, svg is special because of svgr
      const svgAssetRule = config.module.rules
        .get(CHAIN_ID.RULE.SVG)
        .oneOfs.get(CHAIN_ID.ONE_OF.SVG_ASSET);
      const originalTypeOptions = svgAssetRule.get('type');
      const originalParserOptions = svgAssetRule.get('parser');
      const originalGeneratorOptions = svgAssetRule.get('generator');

      const isUserSetPublicPath = config.output.get('publicPath') !== 'auto';

      // if user sets publicPath, do not preserve asset import
      const generatorOptions = isUserSetPublicPath
        ? originalGeneratorOptions
        : {
            ...originalGeneratorOptions,
            importMode: 'preserve',
          };

      const rule = config.module.rule(CHAIN_ID.RULE.SVG);

      rule.oneOf(CHAIN_ID.ONE_OF.SVG_ASSET).generator(generatorOptions).issuer({
        not: CSS_EXTENSIONS_PATTERN,
      });

      rule
        .oneOf(`${CHAIN_ID.ONE_OF.SVG_ASSET}-for-css`)
        .type(originalTypeOptions)
        .parser(originalParserOptions)
        .generator(originalGeneratorOptions)
        .issuer(CSS_EXTENSIONS_PATTERN);

      // 2. modify other assets rules
      const ruleIds = [
        CHAIN_ID.RULE.FONT,
        CHAIN_ID.RULE.MEDIA,
        CHAIN_ID.RULE.IMAGE,
        CHAIN_ID.RULE.ADDITIONAL_ASSETS,
      ];
      for (const ruleId of ruleIds) {
        const oneOfId = `${ruleId}-asset`;
        const assetRule = config.module.rules.get(ruleId);
        if (!assetRule) {
          continue;
        }
        const assetRuleOneOf = assetRule.oneOfs.get(oneOfId);

        const originalTypeOptions = assetRuleOneOf.get('type');
        const originalParserOptions = assetRuleOneOf.get('parser');
        const originalGeneratorOptions = assetRuleOneOf.get('generator');

        const generatorOptions = isUserSetPublicPath
          ? originalGeneratorOptions
          : {
              ...originalGeneratorOptions,
              importMode: 'preserve',
            };

        const rule = config.module.rule(ruleId);
        rule.oneOf(oneOfId).generator(generatorOptions).issuer({
          not: CSS_EXTENSIONS_PATTERN,
        });

        rule
          .oneOf(`${oneOfId}-for-css`)
          .type(originalTypeOptions)
          .parser(originalParserOptions)
          .generator(originalGeneratorOptions)
          .issuer(CSS_EXTENSIONS_PATTERN);
      }

      // for svgr
      // 1. remove __webpack_require__.p in svgr url-loader and file-loader
      const isUsingSvgr = Boolean(
        config.module
          .rule(CHAIN_ID.RULE.SVG)
          .oneOf(CHAIN_ID.RULE.SVG)
          .uses.has(CHAIN_ID.USE.SVGR),
      );
      if (isUsingSvgr) {
        const urlLoaderRule = config.module
          .rule(CHAIN_ID.RULE.SVG)
          .oneOf(CHAIN_ID.ONE_OF.SVG)
          .use(CHAIN_ID.USE.URL);

        const originalOptions = urlLoaderRule.get('options');

        urlLoaderRule.options({
          ...originalOptions,
          publicPath: (url: string) => `${PUBLIC_PATH_PLACEHOLDER}${url}`,
        });
        config.plugin(LibSvgrPatchPlugin.name).use(LibSvgrPatchPlugin, []);
      }
      // 2. in bundleless, only support transform the svg asset to mixedImport svgr file
      // remove issuer to make every svg asset is transformed
      if (!bundle) {
        if (isUsingSvgr) {
          const rule = config.module
            .rule(CHAIN_ID.RULE.SVG)
            .oneOf(CHAIN_ID.ONE_OF.SVG);
          rule.issuer([]);
        }
      }

      // css-asset
      // preserve './' in css url
      // in bundleless, we set this in libCssExtractLoader
      // in bundle, we set this by https://github.com/web-infra-dev/rspack/pull/8946
      if (bundle) {
        config.plugins.get(CHAIN_ID.PLUGIN.MINI_CSS_EXTRACT)?.tap((options) => {
          return [
            {
              ...options[0],
              enforceRelative: true,
            },
          ];
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
