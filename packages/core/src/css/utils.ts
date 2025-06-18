import path from 'node:path';
import type { CSSLoaderOptions } from '@rsbuild/core';
import { CSS_EXTENSIONS_PATTERN } from '../constant';

// https://rsbuild.rs/config/output/css-modules#cssmodulesauto
export type CssLoaderOptionsAuto = CSSLoaderOptions['modules'] extends infer T
  ? T extends { auto?: any }
    ? T['auto']
    : never
  : never;

/**
 * This function is copied from
 * https://github.com/webpack-contrib/mini-css-extract-plugin/blob/3effaa0319bad5cc1bf0ae760553bf7abcbc35a4/src/utils.js#L169
 * linted by biome
 */
export function getUndoPath(
  filename: string,
  outputPathArg: string,
  enforceRelative: boolean,
): string {
  let depth = -1;
  let append = '';

  let outputPath = outputPathArg.replace(/[\\/]$/, '');

  for (const part of filename.split(/[/\\]+/)) {
    if (part === '..') {
      if (depth > -1) {
        depth--;
      } else {
        const i = outputPath.lastIndexOf('/');
        const j = outputPath.lastIndexOf('\\');
        const pos = i < 0 ? j : j < 0 ? i : Math.max(i, j);

        if (pos < 0) {
          return `${outputPath}/`;
        }

        append = `${outputPath.slice(pos + 1)}/${append}`;

        outputPath = outputPath.slice(0, pos);
      }
    } else if (part !== '.') {
      depth++;
    }
  }

  return depth > 0
    ? `${'../'.repeat(depth)}${append}`
    : enforceRelative
      ? `./${append}`
      : append;
}

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
