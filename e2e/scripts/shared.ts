import { join } from 'node:path';
import { mergeRsbuildConfig as mergeConfig } from '@rsbuild/core';
import type { LibConfig, RslibConfig } from '@rslib/core';
import { globContentJSON } from '#helper';
import { build } from '../../packages/core/src/build';
import { loadConfig } from '../../packages/core/src/config';

export function generateBundleEsmConfig(
  cwd: string,
  config: LibConfig = {},
): LibConfig {
  const esmBasicConfig: LibConfig = {
    format: 'esm',
    output: {
      distPath: {
        root: join(cwd, './dist/esm'),
      },
    },
  };

  return mergeConfig(esmBasicConfig, config)!;
}

export function generateBundleCjsConfig(
  cwd: string,
  config: LibConfig = {},
): LibConfig {
  const cjsBasicConfig: LibConfig = {
    format: 'cjs',
    output: {
      distPath: {
        root: join(cwd, './dist/cjs'),
      },
    },
  };

  return mergeConfig(cjsBasicConfig, config)!;
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

export const buildAndGetResults = async (fixturePath: string) => {
  const rslibConfig = await loadConfig(join(fixturePath, 'rslib.config.ts'));
  await build(rslibConfig);
  const entries = await getEntryJsResults(rslibConfig);
  return { entries };
};
