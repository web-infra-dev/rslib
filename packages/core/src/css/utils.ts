import path from 'node:path';
import type { CSSLoaderOptions } from '@rsbuild/core';
import { CSS_EXTENSIONS_PATTERN } from '../constant';
import { parsePathQueryFragment } from '../utils/path';

// https://rsbuild.rs/config/output/css-modules#cssmodulesauto
export type CssLoaderOptionsAuto = CSSLoaderOptions['modules'] extends infer T
  ? T extends { auto?: any }
    ? T['auto']
    : never
  : never;

/**
 * This function is copied from
 * https://github.com/webpack-contrib/mini-css-extract-plugin/blob/3effaa0319bad5cc1bf0ae760553bf7abcbc35a4/src/utils.js#L169
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
  const { path } = parsePathQueryFragment(filepath);
  return CSS_EXTENSIONS_PATTERN.test(path);
}

const CSS_MODULE_REG = /\.module\.\w+$/i;

export function isCssModulesFile(
  filepath: string,
  auto: CssLoaderOptionsAuto,
): boolean {
  const {
    path: resourcePath,
    query,
    fragment,
  } = parsePathQueryFragment(filepath);
  const filename = path.basename(resourcePath);
  if (auto === true) {
    return CSS_MODULE_REG.test(filename);
  }

  if (auto instanceof RegExp) {
    return auto.test(resourcePath);
  }

  if (typeof auto === 'function') {
    // this is a mock for loader
    return auto(resourcePath, query, fragment);
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
