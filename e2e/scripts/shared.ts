import { join } from 'node:path';
import {
  type InspectConfigResult,
  mergeRsbuildConfig as mergeConfig,
} from '@rsbuild/core';
import type { LibConfig, RslibConfig } from '@rslib/core';
import { build, loadConfig } from '@rslib/core';
import { globContentJSON } from './helper';

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

export async function getResults(
  rslibConfig: RslibConfig,
  fixturePath: string,
  type: 'js' | 'dts',
) {
  const files: Record<string, string[]> = {};
  const contents: Record<string, Record<string, string>> = {};
  const entries: Record<string, string> = {};
  const entryFiles: Record<string, string> = {};

  for (const libConfig of rslibConfig.lib) {
    let globFolder = '';
    if (type === 'js') {
      globFolder = libConfig?.output?.distPath?.root!;
    } else if (type === 'dts' && libConfig.dts !== false) {
      globFolder =
        libConfig.dts?.distPath! ?? libConfig?.output?.distPath?.root!;
    }

    if (!globFolder) continue;

    const regex = type === 'dts' ? /\.d.(ts|cts|mts)$/ : /\.(js|cjs|mjs)$/;

    const rawContent = await globContentJSON(globFolder, {
      absolute: true,
      ignore: ['/**/*.map'],
    });

    const content: Record<string, string> = {};

    for (const key of Object.keys(rawContent)) {
      const newKey = key.replace(fixturePath, '.');
      content[newKey] = rawContent[key]!;
    }

    const fileSet = Object.keys(content).filter((file) => regex.test(file));
    const filterContent: Record<string, string> = {};
    for (const key of fileSet) {
      if (content[key]) {
        filterContent[key] = content[key];
      }
    }

    if (fileSet.length) {
      files[libConfig.format!] = fileSet;
      contents[libConfig.format!] = filterContent;
    }

    // Only applied in bundle mode, a shortcut to get single entry result
    if (libConfig.bundle !== false && fileSet.length === 1) {
      entries[libConfig.format!] = content[fileSet[0]!]!;
      entryFiles[libConfig.format!] = fileSet[0]!;
    }
  }

  return {
    files,
    contents,
    entries,
    entryFiles,
  };
}

export const buildAndGetResults = async (
  fixturePath: string,
  configFile = 'rslib.config.ts',
  type: 'js' | 'dts' = 'js',
): Promise<{
  contents: Record<string, Record<string, string>>;
  files: Record<string, string[]>;
  entries: Record<string, string>;
  entryFiles: Record<string, string>;
  rspackConfig: InspectConfigResult['origin']['bundlerConfigs'];
  rsbuildConfig: InspectConfigResult['origin']['rsbuildConfig'];
  isSuccess: boolean;
}> => {
  const rslibConfig = await loadConfig(join(fixturePath, configFile));
  process.chdir(fixturePath);
  const rsbuildInstance = await build(rslibConfig);
  const {
    origin: { bundlerConfigs, rsbuildConfig },
  } = await rsbuildInstance.inspectConfig({ verbose: true });

  const results = await getResults(rslibConfig, fixturePath, type);
  return {
    contents: results.contents,
    files: results.files,
    entries: results.entries,
    entryFiles: results.entryFiles,
    rspackConfig: bundlerConfigs,
    rsbuildConfig: rsbuildConfig,
    isSuccess: Boolean(rsbuildInstance),
  };
};
