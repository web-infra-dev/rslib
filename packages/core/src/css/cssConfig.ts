import { createRequire } from 'node:module';
import path from 'node:path';
import type {
  CSSLoaderOptions,
  EnvironmentConfig,
  RsbuildPlugin,
} from '@rsbuild/core';
import { CSS_EXTENSIONS_PATTERN } from '../constant';
import { LibCssExtractPlugin } from './LibCssExtractPlugin';
const require = createRequire(import.meta.url);

export const RSLIB_CSS_ENTRY_FLAG = '__rslib_css__';

// https://rsbuild.dev/config/output/css-modules#cssmodulesauto
export type CssLoaderOptionsAuto = CSSLoaderOptions['modules'] extends infer T
  ? T extends { auto?: any }
    ? T['auto']
    : never
  : never;

export function isCssFile(filepath: string): boolean {
  return CSS_EXTENSIONS_PATTERN.test(filepath);
}

const CSS_MODULE_REG = /\.module\.\w+$/i;

/**
 * This function is modified based on
 * https://github.com/web-infra-dev/rspack/blob/7b80a45a1c58de7bc506dbb107fad6fda37d2a1f/packages/rspack/src/loader-runner/index.ts#L903
 */
const PATH_QUERY_FRAGMENT_REGEXP =
  /^((?:\u200b.|[^?#\u200b])*)(\?(?:\u200b.|[^#\u200b])*)?(#.*)?$/;
export function parsePathQueryFragment(str: string): {
  path: string;
  query: string;
  fragment: string;
} {
  const match = PATH_QUERY_FRAGMENT_REGEXP.exec(str);
  return {
    path: match?.[1]?.replace(/\u200b(.)/g, '$1') || '',
    query: match?.[2] ? match[2].replace(/\u200b(.)/g, '$1') : '',
    fragment: match?.[3] || '',
  };
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
    const { path, query, fragment } = parsePathQueryFragment(filepath);
    // this is a mock for loader
    return auto(path, query, fragment);
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

type ExternalCallback = (arg0?: undefined, arg1?: string) => void;

export function cssExternalHandler(
  request: string,
  callback: ExternalCallback,
  jsExtension: string,
  auto: CssLoaderOptionsAuto,
  isStyleRedirect: boolean,
  issuer: string,
): void | false {
  const isCssModulesRequest = isCssModulesFile(request, auto);

  // cssExtract would execute the file handled by css-loader, so we cannot external the "helper import" from css-loader
  // 1. do not external @rsbuild/core/compiled/css-loader/noSourceMaps.js, sourceMaps.js, api.mjs etc.
  if (/compiled\/css-loader\//.test(request)) {
    return callback();
  }
  // 2.
  if (isCssFile(issuer) && !isCssFile(request)) {
    return callback();
  }

  // 1. css modules: import './CounterButton.module.scss' -> import './CounterButton.module.mjs'
  // 2. css global: import './CounterButton.scss' -> import './CounterButton.css'
  if (request[0] === '.' && isCssFile(request)) {
    // preserve import './CounterButton.module.scss'
    if (!isStyleRedirect) {
      return callback(undefined, request);
    }
    if (isCssModulesRequest) {
      return callback(undefined, request.replace(/\.[^.]+$/, jsExtension));
    }
    return callback(undefined, request.replace(/\.[^.]+$/, '.css'));
  }

  return false;
}

const PLUGIN_NAME = 'rsbuild:lib-css';

const pluginLibCss = (rootDir: string): RsbuildPlugin => ({
  name: PLUGIN_NAME,
  setup(api) {
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
  bundle = true,
): EnvironmentConfig => {
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
