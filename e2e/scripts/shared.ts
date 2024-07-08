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
  const files: Record<string, string> = {};
  const contents: Record<string, string> = {};

  for (const libConfig of rslibConfig.lib) {
    const result = await globContentJSON(libConfig?.output?.distPath?.root!, {
      absolute: true,
      ignore: ['/**/*.map'],
    });

    const entryJs = Object.keys(result).find((file) =>
      /\.(js|cjs|mjs)$/.test(file),
    );

    if (entryJs) {
      files[libConfig.format!] = entryJs;
      contents[libConfig.format!] = result[entryJs]!;
    }
  }

  return {
    files,
    contents,
  };
}

export const buildAndGetEntryJsResults = async (fixturePath: string) => {
  const rslibConfig = await loadConfig(join(fixturePath, 'rslib.config.ts'));
  await build(rslibConfig);
  const results = await getEntryJsResults(rslibConfig);
  return {
    contents: results.contents,
    files: results.files,
  };
};
