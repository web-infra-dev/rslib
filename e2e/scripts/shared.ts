import { join } from 'node:path';
import type { LibConfig, RsbuildInstance } from '@rslib/core';
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

export async function getEntryJsResults(instance: RsbuildInstance[]) {
  const results: Record<string, string> = {};

  for (let i = 0; i < instance.length; i++) {
    const result = await globContentJSON(instance[i]!.context.distPath, {
      absolute: true,
      ignore: ['/**/*.map'],
    });

    const entryJs = Object.keys(result).find((file) => file.endsWith('.js'));
    const format = instance[i]!.context.distPath.split('/').pop();

    if (entryJs) {
      results[format!] = result[entryJs]!;
    }
  }

  return results;
}
