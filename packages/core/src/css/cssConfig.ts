import { createRequire } from 'node:module';
import path from 'node:path';
import type { RsbuildConfig, RsbuildPlugin } from '@rsbuild/core';
import { CSS_EXTENSIONS_PATTERN } from '../constant';
import { RemoveCssExtractAssetPlugin } from './RemoveCssExtractAssetPlugin';

const require = createRequire(import.meta.url);
const CSS_MODULE_REG = /\.module\.\w+$/i;

export const RSLIB_TEMP_CSS_DIR = '__rslib_css__';

// https://rsbuild.dev/zh/config/output/css-modules#cssmodulesauto
export type CssLoaderOptionsAuto =
  | boolean
  | RegExp
  | ((
      resourcePath: string,
      resourceQuery: string,
      resourceFragment: string,
    ) => boolean);

export function isCssFile(filepath: string): boolean {
  return CSS_EXTENSIONS_PATTERN.test(filepath);
}

export function isCssModulesFile(
  filepath: string,
  auto: CssLoaderOptionsAuto,
): boolean {
  const filename = path.basename(filepath);
  if (auto === true) {
    return CSS_MODULE_REG.test(filename);
  }

  if (auto instanceof RegExp) {
    return auto.test(filepath);
  }

  if (typeof auto === 'function') {
    return auto(filepath, '', '');
  }

  return false;
}

export function isCssGlobalFile(
  filepath: string,
  auto: CssLoaderOptionsAuto,
): boolean {
  const isCss = isCssFile(filepath);
  if (!isCss) {
    return false;
  }
  const isCssModules = isCssModulesFile(filepath, auto);
  return !isCssModules;
}

type ExternalCallback = (arg0?: null, arg1?: string) => void;

export function cssExternalHandler(
  request: string,
  callback: ExternalCallback,
  jsExtension: string,
  auto: CssLoaderOptionsAuto,
  isStyleRedirect: boolean,
): void | false {
  const isCssModulesRequest = isCssModulesFile(request, auto);

  // cssExtract would execute the file handled by css-loader, so we cannot external the "helper import" from css-loader
  // do not external @rsbuild/core/compiled/css-loader/noSourceMaps.js, sourceMaps.js, api.mjs etc.
  if (/compiled\/css-loader\//.test(request)) {
    return callback();
  }

  // 1. css modules: import './CounterButton.module.scss' -> import './CounterButton.module.mjs'
  // 2. css global: import './CounterButton.scss' -> import './CounterButton.css'
  if (request[0] === '.' && CSS_EXTENSIONS_PATTERN.test(request)) {
    // preserve import './CounterButton.module.scss'
    if (!isStyleRedirect) {
      return callback(null, request);
    }
    if (isCssModulesRequest) {
      return callback(null, request.replace(/\.[^.]+$/, jsExtension));
    }
    return callback(null, request.replace(/\.[^.]+$/, '.css'));
  }

  return false;
}

const pluginName = 'rsbuild:lib-css';

const pluginLibCss = (rootDir: string): RsbuildPlugin => ({
  name: pluginName,
  setup(api) {
    api.modifyBundlerChain((config, { CHAIN_ID }) => {
      const cssExtract = CHAIN_ID.PLUGIN.MINI_CSS_EXTRACT;
      config.plugins.delete(cssExtract);
      config
        .plugin(RemoveCssExtractAssetPlugin.name)
        .use(RemoveCssExtractAssetPlugin, [
          {
            include: new RegExp(`^${RSLIB_TEMP_CSS_DIR}`),
          },
        ]);

      for (const ruleId of [
        CHAIN_ID.RULE.CSS,
        CHAIN_ID.RULE.SASS,
        CHAIN_ID.RULE.LESS,
        CHAIN_ID.RULE.STYLUS,
      ]) {
        const rule = config.module.rule(ruleId);
        if (rule.uses.has(CHAIN_ID.USE.MINI_CSS_EXTRACT)) {
          rule
            .use(CHAIN_ID.USE.MINI_CSS_EXTRACT)
            .loader(require.resolve('./LibCssExtractLoader.js'))
            .options({
              rootDir,
            });
        }
      }
    });
  },
});

export const composeCssConfig = (
  rootDir: string | null,
  bundle = true,
): RsbuildConfig => {
  if (bundle || rootDir === null) {
    return {};
  }

  return {
    plugins: [pluginLibCss(rootDir)],
    tools: {
      cssLoader: {
        // Otherwise, external variables will be executed by css-extract and cause an error.
        // e.g: `@import url('./a.css');`
        import: false,
      },
    },
  };
};
