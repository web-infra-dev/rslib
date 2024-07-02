import { join } from 'node:path';
import type { LibConfig, RslibConfig } from '@rslib/core';
import { globContentJSON } from '#helper';

export function generateBundleEsmConfig(cwd: string): LibConfig {
  return {
    format: 'esm',
    output: {
      distPath: {
        root: join(cwd, './dist/esm'),
      },
    },
  };
}

export function generateBundleCjsConfig(cwd: string): LibConfig {
  return {
    format: 'cjs',
    output: {
      distPath: {
        root: join(cwd, './dist/cjs'),
      },
    },
  };
}

export async function getEntryJsResults(rslibConfig: RslibConfig) {
  const results: Record<string, string> = {};

  for (const libConfig of rslibConfig.lib) {
    const result = await globContentJSON(libConfig?.output?.distPath?.root!, {
      absolute: true,
      ignore: ['/**/*.map'],
    });

    const entryJs = Object.keys(result).find((file) => file.endsWith('.js'));

    if (entryJs) {
      results[libConfig.format!] = result[entryJs]!;
    }
  }

  return results;
}
