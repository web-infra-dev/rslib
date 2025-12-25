import { mergeRsbuildConfig } from '@rsbuild/core';
import type { LibConfig, RslibConfig } from './types';

export type RslibConfigWithOptionalLib = Omit<RslibConfig, 'lib'> & {
  lib?: RslibConfig['lib'];
};

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
 * Merge multiple Rslib configurations into a single configuration.
 *
 * For the `lib` array, items are merged based on their `id` field:
 * - Items with the same `id` are deep merged together using `mergeRsbuildConfig`
 * - Items without `id` are appended to the result array
 * - The order of items with `id` is preserved based on their first occurrence
 *
 * Other configuration fields are merged using `mergeRsbuildConfig`.
 */
export function mergeRslibConfig(
  ...originalConfigs: (RslibConfigWithOptionalLib | undefined)[]
): RslibConfigWithOptionalLib {
  const definedConfigs = originalConfigs.filter(
    (config): config is RslibConfigWithOptionalLib => config !== undefined,
  );

  if (definedConfigs.length === 0) {
    return {};
  }

  // Extract lib arrays from all configs
  const libArrays = definedConfigs.map((config) => config.lib);

  // Create configs without lib for merging with mergeRsbuildConfig
  const configsWithoutLib = definedConfigs.map((config) => {
    const { lib: _, ...rest } = config;
    return rest;
  });

  // Merge non-lib parts using mergeRsbuildConfig
  const mergedConfig = mergeRsbuildConfig(
    ...configsWithoutLib,
  ) as RslibConfigWithOptionalLib;

  // Merge lib arrays with id-based merging
  const mergedLib = mergeLibConfigs(...libArrays);
  if (mergedLib !== undefined) {
    mergedConfig.lib = mergedLib;
  }

  return mergedConfig;
}
