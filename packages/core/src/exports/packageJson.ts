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
 * Merge the generated value of a subpath into its existing value. Generated
 * format conditions are replaced as a whole. Existing types and default targets
 * are kept unless this build supplies replacements, with default kept last.
 */
function mergeSubpath(
  key: string,
  existing: unknown,
  generated: string | ExportsField,
): unknown {
  if (
    existing === undefined ||
    existing === null ||
    typeof existing === 'string' ||
    Array.isArray(existing)
  ) {
    return generated;
  }

  if (!isObject(existing)) {
    throw new Error(
      `Failed to update the "${key}" subpath in the "exports" field of package.json because its existing value is not a string or a conditions object.`,
    );
  }

  const generatedValue =
    typeof generated === 'string' ? { default: generated } : generated;
  const replacedConditions = new Set([
    'import',
    'require',
    ...Object.keys(generatedValue),
  ]);
  const userKeys = Object.keys(existing).filter(
    (condition) => !replacedConditions.has(condition),
  );
  if (userKeys.length === 0) return generated;

  const { default: defaultTarget = existing.default, ...generatedConditions } =
    generatedValue;

  // Generated conditions take the place of the first generated condition in the
  // existing value, or go after the user conditions when there is none.
  const merged: Record<string, unknown> = {};
  let inserted = false;
  for (const [condition, value] of Object.entries(existing)) {
    if (replacedConditions.has(condition)) {
      if (!inserted) {
        Object.assign(merged, generatedConditions);
        inserted = true;
      }
      continue;
    }
    if (condition !== 'default') merged[condition] = value;
  }
  if (!inserted) Object.assign(merged, generatedConditions);
  if (defaultTarget !== undefined) merged.default = defaultTarget;
  return merged;
}

/**
 * Merge the generated subpaths into the existing `exports` field.
 * Subpaths that only exist in package.json are kept, subpaths that exist in
 * both are merged by conditions.
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

  const mergedSubpaths: MergedExportsField = {};
  for (const [key, value] of Object.entries(generated)) {
    const merged = mergeSubpath(key, existing[key], value);
    if (
      Object.hasOwn(existing, key) &&
      !isDeepStrictEqual(existing[key], merged)
    ) {
      logger.warn(
        `Updated the "${key}" subpath in the "exports" field of package.json to ${JSON.stringify(merged)}.`,
      );
    }
    mergedSubpaths[key] = merged;
  }

  // Existing subpaths keep their order, and new subpaths are appended, except
  // that a newly added main subpath goes first.
  return {
    ...(Object.hasOwn(generated, '.') && !Object.hasOwn(existing, '.')
      ? { '.': mergedSubpaths['.'] }
      : {}),
    ...existing,
    ...mergedSubpaths,
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
