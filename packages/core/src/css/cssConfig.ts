import { createRequire } from 'node:module';
import type { EnvironmentConfig, RsbuildPlugin } from '@rsbuild/core';
import { LibCssExtractPlugin } from './LibCssExtractPlugin';
import {
  type CssLoaderOptionsAuto,
  isCssFile,
  isCssModulesFile,
} from './utils';

const require = createRequire(import.meta.url);

export const RSLIB_CSS_ENTRY_FLAG = '__rslib_css__';

type ExternalCallback = (arg0?: undefined, arg1?: string) => void;

export async function cssExternalHandler(
  request: string,
  callback: ExternalCallback,
  jsExtension: string,
  auto: CssLoaderOptionsAuto,
  styleRedirectPath: boolean,
  styleRedirectExtension: boolean,
  redirectedPath: string | undefined,
  issuer: string,
): Promise<false | void> {
  // cssExtract: do not external @rsbuild/core/compiled/css-loader/noSourceMaps.js, sourceMaps.js, api.mjs etc.
  // cssExtract would execute the result handled by css-loader with importModule, so we cannot external the "helper import" from css-loader
  if (/compiled\/css-loader\//.test(request)) {
    callback();
    return;
  }

  let resolvedRequest = request;

  if (styleRedirectPath) {
    if (redirectedPath === undefined) {
      return false;
    }
    resolvedRequest = redirectedPath;
  }

  if (!isCssFile(resolvedRequest)) {
    // cssExtract: do not external assets module import
    if (isCssFile(issuer)) {
      callback();
      return;
    }
    return false;
  }

  // 1. css modules: import './CounterButton.module.scss' -> import './CounterButton.module.mjs'
  // 2. css global: import './CounterButton.scss' -> import './CounterButton.css'
  if (styleRedirectExtension) {
    const isCssModulesRequest = isCssModulesFile(resolvedRequest, auto);
    if (isCssModulesRequest) {
      callback(undefined, resolvedRequest.replace(/\.[^.]+$/, jsExtension));
      return;
    }
    callback(undefined, resolvedRequest.replace(/\.[^.]+$/, '.css'));
    return;
  }

  callback(undefined, resolvedRequest);
}

const PLUGIN_NAME = 'rsbuild:lib-css';

// 1. replace CssExtractPlugin.loader with libCssExtractLoader
// 2. replace CssExtractPlugin with LibCssExtractPlugin
const pluginLibCss = (
  rootDir: string,
  auto: CssLoaderOptionsAuto,
  banner?: string,
  footer?: string,
): RsbuildPlugin => ({
  name: PLUGIN_NAME,
  setup(api) {
    // 1. mark and remove the "normal css asset" (contain RSLIB_CSS_ENTRY_FLAG)
    // 2. preserve CSS Modules asset
    api.processAssets(
      { stage: 'additional' }, // deleteAsset as soon as possible for small perf
      ({ assets, compilation }) => {
        for (const key of Object.keys(assets)) {
          if (key.match(RSLIB_CSS_ENTRY_FLAG)) {
            compilation.deleteAsset(key);
          }
        }
      },
    );

    api.modifyBundlerChain((config, { CHAIN_ID }) => {
      let isUsingCssExtract = false;
      for (const ruleId of [
        CHAIN_ID.RULE.CSS,
        CHAIN_ID.RULE.SASS,
        CHAIN_ID.RULE.LESS,
        CHAIN_ID.RULE.STYLUS,
      ]) {
        const rule = config.module.rule(ruleId);
        if (rule.uses.has(CHAIN_ID.USE.MINI_CSS_EXTRACT)) {
          isUsingCssExtract = true;
          rule
            .use(CHAIN_ID.USE.MINI_CSS_EXTRACT)
            .loader(require.resolve('./libCssExtractLoader.js'))
            .options({
              rootDir,
              auto,
              banner,
              footer,
            });
        }
      }

      if (isUsingCssExtract) {
        const cssExtract = CHAIN_ID.PLUGIN.MINI_CSS_EXTRACT;
        config.plugins.delete(cssExtract);
        config.plugin(LibCssExtractPlugin.name).use(LibCssExtractPlugin);
      }
    });
  },
});

export const composeCssConfig = (
  rootDir: string | null,
  auto: CssLoaderOptionsAuto,
  bundle = true,
  banner?: string,
  footer?: string,
): EnvironmentConfig => {
  if (bundle || rootDir === null) {
    return {};
  }

  return {
    plugins: [pluginLibCss(rootDir, auto, banner, footer)],
    tools: {
      cssLoader: {
        // Otherwise, external variables will be executed by css-extract and cause an error.
        // e.g: `@import url('./a.css');`
        import: false,
      },
    },
  };
};
