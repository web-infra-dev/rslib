import { mergeRsbuildConfig } from '@rsbuild/core';
import type { LibConfig, RslibConfig } from './types';

/**
 * Merge multiple lib arrays, merging items with the same id.
 * Items without id are appended to the result.
 */
function mergeLibConfigs(
  ...libArrays: (LibConfig[] | undefined)[]
): LibConfig[] | undefined {
  const definedLibArrays = libArrays.filter(
    (lib): lib is LibConfig[] => lib !== undefined,
  );

  if (definedLibArrays.length === 0) {
    return undefined;
  }

  const mergedById = new Map<string, LibConfig>();
  const itemsWithoutId: LibConfig[] = [];

  for (const libArray of definedLibArrays) {
    for (const libConfig of libArray) {
      if (libConfig.id !== undefined) {
        const existing = mergedById.get(libConfig.id);
        if (existing) {
          // Merge with existing config that has the same id
          mergedById.set(libConfig.id, mergeRsbuildConfig(existing, libConfig));
        } else {
          mergedById.set(libConfig.id, libConfig);
        }
      } else {
        itemsWithoutId.push(libConfig);
      }
    }
  }

  return [...mergedById.values(), ...itemsWithoutId];
}

/**
 * Merge multiple `exports` options. `true` and an options object enable it with
 * the options, `extra` is merged by subpath, as each subpath is replaced as a
 * whole, and `transform` functions are called in order.
 */
function mergeExportsConfigs(
  ...exportsConfigs: RslibConfig['exports'][]
): RslibConfig['exports'] {
  return exportsConfigs.reduce((merged, config) => {
    if (config === undefined) return merged;
    if (config === true) return typeof merged === 'object' ? merged : true;
    if (config === false || typeof merged !== 'object') return config;

    const result = { ...merged, ...config };
    if (merged.extra && config.extra) {
      result.extra = { ...merged.extra, ...config.extra };
    }
    if (merged.transform && config.transform) {
      result.transform = [merged.transform, config.transform].flat();
    }
    return result;
  }, undefined);
}

/**
 * Merge multiple Rslib configurations into a single configuration.
 *
 * For the `lib` array, items are merged based on their `id` field:
 * - Items with the same `id` are deep merged together using `mergeRsbuildConfig`
 * - Items without `id` are appended to the result array
 * - The order of items with `id` is preserved based on their first occurrence
 *
 * The `exports` field is merged by `mergeExportsConfigs`, and other
 * configuration fields are merged using `mergeRsbuildConfig`.
 */
export function mergeRslibConfig(
  ...originalConfigs: (RslibConfig | undefined)[]
): RslibConfig {
  const definedConfigs = originalConfigs.filter(
    (config): config is RslibConfig => config !== undefined,
  );

  if (definedConfigs.length === 0) {
    return {};
  }

  // Extract lib arrays from all configs
  const libArrays = definedConfigs.map((config) => config.lib);

  // Create configs without lib and exports for merging with mergeRsbuildConfig
  const configsWithoutLib = definedConfigs.map((config) => {
    const { lib: _lib, exports: _exports, ...rest } = config;
    return rest;
  });

  // Merge non-lib parts using mergeRsbuildConfig
  const mergedConfig = mergeRsbuildConfig(...configsWithoutLib) as RslibConfig;

  // Merge lib arrays with id-based merging
  const mergedLib = mergeLibConfigs(...libArrays);
  if (mergedLib !== undefined) {
    mergedConfig.lib = mergedLib;
  }

  const mergedExports = mergeExportsConfigs(
    ...definedConfigs.map((config) => config.exports),
  );
  if (mergedExports !== undefined) {
    mergedConfig.exports = mergedExports;
  }

  return mergedConfig;
}
