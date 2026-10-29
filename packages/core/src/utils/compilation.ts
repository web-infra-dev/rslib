import type { Rspack } from '@rsbuild/core';

export function getAssetNames(compilation: Rspack.Compilation): string[] {
  // The assets Proxy uses this method for ownKeys. Calling it directly avoids
  // Proxy key validation and the per-asset descriptor lookups in Object.keys.
  return compilation.__internal__getAssetFilenames();
}
