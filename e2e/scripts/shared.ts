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

export async function getJsResults(rslibConfig: RslibConfig) {
  const files: Record<string, string[]> = {};
  const contents: Record<string, Record<string, string>> = {};
  const entries: Record<string, string> = {};
  const entryFiles: Record<string, string> = {};

  for (const libConfig of rslibConfig.lib) {
    const content = await globContentJSON(libConfig?.output?.distPath?.root!, {
      absolute: true,
      ignore: ['/**/*.map'],
    });

    const jsFiles = Object.keys(content).filter((file) =>
      /\.(js|cjs|mjs)$/.test(file),
    );

    if (jsFiles.length) {
      files[libConfig.format!] = jsFiles;
      contents[libConfig.format!] = content;
    }

    // Only applied in bundle mode, a shortcut to get single entry result
    if (libConfig.bundle !== false && jsFiles.length === 1) {
      entries[libConfig.format!] = Object.values(content)[0]!;
      entryFiles[libConfig.format!] = jsFiles[0]!;
    }
  }

  return {
    files,
    contents,
    entries,
    entryFiles,
  };
}

export const buildAndGetJsResults = async (fixturePath: string) => {
  const rslibConfig = await loadConfig(join(fixturePath, 'rslib.config.ts'));
  process.chdir(fixturePath);
  await build(rslibConfig);
  const results = await getJsResults(rslibConfig);
  return {
    contents: results.contents,
    files: results.files,
    entries: results.entries,
    entryFiles: results.entryFiles,
  };
};
