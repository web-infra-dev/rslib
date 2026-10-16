import fs from 'node:fs';
import path from 'node:path';
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

  for (const [key, value] of Object.entries(generated)) {
    if (
      Object.hasOwn(existing, key) &&
      !isDeepStrictEqual(existing[key], value)
    ) {
      logger.warn(
        `Overwrote the "${key}" subpath in the "exports" field of package.json with ${JSON.stringify(value)}.`,
      );
    }
  }

  // Existing subpaths keep their order, and new subpaths are appended, except
  // that a newly added main subpath goes first.
  return {
    ...(Object.hasOwn(generated, '.') && !Object.hasOwn(existing, '.')
      ? { '.': generated['.'] }
      : {}),
    ...existing,
    ...generated,
  };
}

function collectTargets(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectTargets);
  if (isObject(value)) return Object.values(value).flatMap(collectTargets);
  return [];
}

function isPathInside(dir: string, file: string): boolean {
  const relative = path.relative(dir, file);
  return (
    relative !== '' &&
    relative !== '..' &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  );
}

/**
 * Find the existing subpaths that were not generated in this build, but point
 * to missing files in the output directories. They are likely left over from a
 * previous build.
 */
export function findStaleSubpaths({
  existing,
  generated,
  root,
  outputPaths,
}: {
  existing: unknown;
  generated: ExportsField;
  root: string;
  outputPaths: string[];
}): string[] {
  if (!isObject(existing)) return [];

  const isStaleTarget = (target: string) => {
    if (!target.startsWith('./') || target.includes('*')) return false;
    const file = path.join(root, target);
    return (
      outputPaths.some((outputPath) => isPathInside(outputPath, file)) &&
      !fs.existsSync(file)
    );
  };

  return Object.entries(existing)
    .filter(
      ([key, value]) =>
        !Object.hasOwn(generated, key) &&
        collectTargets(value).some(isStaleTarget),
    )
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
