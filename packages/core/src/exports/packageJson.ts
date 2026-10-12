import { isDeepStrictEqual } from 'node:util';
import { isObject } from '../utils/helper';
import { logger } from '../utils/logger';
import type { ExportsField } from './generate';

export type MergedExportsField = Record<string, unknown>;

function isSubpathMap(value: unknown): value is MergedExportsField {
  return (
    isObject(value) && Object.keys(value).every((key) => key.startsWith('.'))
  );
}

/**
 * Merge the generated subpaths into the existing `exports` field.
 * Subpaths that only exist in package.json are kept, subpaths that exist in
 * both are overwritten by the generated value.
 */
export function mergeExports(
  existing: unknown,
  generated: ExportsField,
): MergedExportsField {
  if (existing === undefined) return generated;

  if (!isSubpathMap(existing)) {
    throw new Error(
      'Failed to update the "exports" field in package.json because the existing value is not a subpath map. Convert it to the subpath form first, e.g. { ".": "./dist/index.js" }.',
    );
  }

  const merged: MergedExportsField = {};
  // Keep the main subpath first when it is newly added.
  if (!Object.hasOwn(existing, '.') && Object.hasOwn(generated, '.')) {
    merged['.'] = generated['.'];
  }
  for (const [key, value] of Object.entries(existing)) {
    if (!Object.hasOwn(generated, key)) {
      merged[key] = value;
      continue;
    }
    if (!isDeepStrictEqual(value, generated[key])) {
      logger.warn(
        `Overwrote the "${key}" subpath in the "exports" field of package.json with ${JSON.stringify(generated[key])}.`,
      );
    }
    merged[key] = generated[key];
  }
  for (const [key, value] of Object.entries(generated)) {
    if (!Object.hasOwn(merged, key)) {
      merged[key] = value;
    }
  }
  return merged;
}

function collectTargets(value: unknown, targets: string[]): void {
  if (typeof value === 'string') {
    targets.push(value);
  } else if (Array.isArray(value)) {
    for (const item of value) collectTargets(item, targets);
  } else if (isObject(value)) {
    for (const item of Object.values(value)) collectTargets(item, targets);
  }
}

/**
 * Find the existing subpaths that were not generated in this build and point
 * to files rejected by `isStaleTarget`, which are likely left over from a
 * previous build.
 */
export function findStaleSubpaths(
  existing: unknown,
  generated: ExportsField,
  isStaleTarget: (target: string) => boolean,
): string[] {
  if (!isSubpathMap(existing)) return [];

  return Object.entries(existing)
    .filter(([key, value]) => {
      if (Object.hasOwn(generated, key)) return false;
      const targets: string[] = [];
      collectTargets(value, targets);
      return targets.some(isStaleTarget);
    })
    .map(([key]) => key);
}

/**
 * Stringify package.json content with the indentation, line endings, and
 * trailing newline of the original text.
 */
export function stringifyPackageJson(
  content: unknown,
  originalText: string,
): string {
  const indent = /^([ \t]+)\S/m.exec(originalText)?.[1] ?? 2;
  const eol = originalText.includes('\r\n') ? '\r\n' : '\n';

  let text = JSON.stringify(content, null, indent);
  if (eol !== '\n') {
    text = text.replaceAll('\n', eol);
  }
  if (originalText.endsWith('\n')) {
    text += eol;
  }
  return text;
}
