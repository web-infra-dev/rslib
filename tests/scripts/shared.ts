import assert from 'node:assert';
import fs from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type InspectConfigResult,
  mergeRsbuildConfig as mergeConfig,
} from '@rsbuild/core';
import type { Format, LibConfig, RslibConfig } from '@rslib/core';
import { build, loadConfig } from '@rslib/core';
import { globContentJSON } from './helper';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function getCwdByExample(exampleName: string) {
  return join(__dirname, '../../examples', exampleName);
}

export function generateBundleEsmConfig(config: LibConfig = {}): LibConfig {
  const esmBasicConfig: LibConfig = {
    format: 'esm',
    output: {
      distPath: {
        root: './dist/esm',
      },
    },
  };

  return mergeConfig(esmBasicConfig, config)!;
}

export function generateBundleCjsConfig(config: LibConfig = {}): LibConfig {
  const cjsBasicConfig: LibConfig = {
    format: 'cjs',
    output: {
      distPath: {
        root: './dist/cjs',
      },
    },
  };

  return mergeConfig(cjsBasicConfig, config)!;
}

export function generateBundleUmdConfig(config: LibConfig = {}): LibConfig {
  const umdBasicConfig: LibConfig = {
    format: 'umd',
    output: {
      distPath: {
        root: './dist/umd',
      },
    },
  };

  return mergeConfig(umdBasicConfig, config)!;
}

export type FormatType = Format | `${Format}${number}`;
type FilePath = string;

type BuildResult = {
  files: Record<FormatType, FilePath[]>;
  contents: Record<FormatType, Record<FilePath, string>>;
  entries: Record<FormatType, string>;
  entryFiles: Record<FormatType, FilePath>;

  rspackConfig: InspectConfigResult['origin']['bundlerConfigs'];
  rsbuildConfig: InspectConfigResult['origin']['rsbuildConfig'];
  isSuccess: boolean;
};

export async function getResults(
  rslibConfig: RslibConfig,
  type: 'js' | 'dts' | 'css',
): Promise<Omit<BuildResult, 'rspackConfig' | 'rsbuildConfig' | 'isSuccess'>> {
  const files: Record<string, string[]> = {};
  const contents: Record<string, Record<string, string>> = {};
  const entries: Record<string, string> = {};
  const entryFiles: Record<string, string> = {};
  const formatIndex: Record<Format, number> = {
    esm: 0,
    cjs: 0,
    umd: 0,
    mf: 0,
  };
  let key = '';

  const formatCount: Record<Format, number> = rslibConfig.lib.reduce(
    (acc, { format }) => {
      acc[format!] = (acc[format!] ?? 0) + 1;
      return acc;
    },
    {} as Record<Format, number>,
  );

  for (const libConfig of rslibConfig.lib) {
    const { format } = libConfig;
    const currentFormatCount = formatCount[format!];
    const currentFormatIndex = formatIndex[format!]++;

    key = currentFormatCount === 1 ? format! : `${format}${currentFormatIndex}`;

    let globFolder = '';
    if (type === 'js' || type === 'css') {
      globFolder = libConfig?.output?.distPath?.root!;
    } else if (type === 'dts' && libConfig.dts !== false) {
      globFolder =
        libConfig.dts === true
          ? libConfig?.output?.distPath?.root!
          : (libConfig.dts?.distPath! ?? libConfig?.output?.distPath?.root!);
    }

    if (!globFolder) continue;

    const regex =
      type === 'dts'
        ? /\.d.(ts|cts|mts)(\.map)?$/
        : type === 'css'
          ? /\.css(\.map)?$/
          : /\.(js|cjs|mjs)(\.map)?$/;

    const content: Record<string, string> = await globContentJSON(globFolder, {
      absolute: true,
    });

    const fileSet = Object.keys(content)
      .filter((file) => regex.test(file))
      .sort();
    const filterContent: Record<string, string> = {};
    for (const key of fileSet) {
      if (content[key]) {
        filterContent[key] = content[key];
      }
    }

    if (fileSet.length) {
      files[key] = fileSet;
      contents[key] = filterContent;
    }

    // Only applied in bundle mode, a shortcut to get single entry result
    if (libConfig.bundle !== false && fileSet.length) {
      let entryFile: string | undefined;
      if (fileSet.length === 1) {
        entryFile = fileSet[0];
      } else {
        entryFile = fileSet.find((file) => file.includes('index'));
      }

      if (typeof entryFile === 'string') {
        entries[key] = content[entryFile]!;
        entryFiles[key] = normalize(entryFile);
      }
    }
  }

  return {
    files,
    contents,
    entries,
    entryFiles,
  };
}

export async function rslibBuild({
  cwd,
  path,
  modifyConfig,
}: {
  cwd: string;
  path?: string;
  modifyConfig?: (config: RslibConfig) => void;
}) {
  const rslibConfig = await loadConfig({
    cwd,
    path,
  });
  modifyConfig?.(rslibConfig);
  process.chdir(cwd);
  const rsbuildInstance = await build(rslibConfig);
  return { rsbuildInstance, rslibConfig };
}

export async function buildAndGetResults(options: {
  fixturePath: string;
  configPath?: string;
  type: 'all';
}): Promise<{
  js: BuildResult;
  dts: BuildResult;
  css: BuildResult;
}>;
export async function buildAndGetResults(options: {
  fixturePath: string;
  configPath?: string;
  type?: 'js' | 'dts' | 'css';
}): Promise<BuildResult>;
export async function buildAndGetResults({
  fixturePath,
  configPath,
  type = 'js',
}: {
  fixturePath: string;
  configPath?: string;
  type?: 'js' | 'dts' | 'css' | 'all';
}) {
  const { rsbuildInstance, rslibConfig } = await rslibBuild({
    cwd: fixturePath,
    path: configPath,
  });
  const {
    origin: { bundlerConfigs, rsbuildConfig },
  } = await rsbuildInstance.inspectConfig({ verbose: true });
  if (type === 'all') {
    const jsResults = await getResults(rslibConfig, 'js');
    const dtsResults = await getResults(rslibConfig, 'dts');
    const cssResults = await getResults(rslibConfig, 'css');
    return {
      js: {
        contents: jsResults.contents,
        files: jsResults.files,
        entries: jsResults.entries,
        entryFiles: jsResults.entryFiles,
        rspackConfig: bundlerConfigs,
        rsbuildConfig: rsbuildConfig,
        isSuccess: Boolean(rsbuildInstance),
      },
      dts: {
        contents: dtsResults.contents,
        files: dtsResults.files,
        entries: dtsResults.entries,
        entryFiles: dtsResults.entryFiles,
        rspackConfig: bundlerConfigs,
        rsbuildConfig: rsbuildConfig,
        isSuccess: Boolean(rsbuildInstance),
      },
      css: {
        contents: cssResults.contents,
        files: cssResults.files,
        entries: cssResults.entries,
        entryFiles: cssResults.entryFiles,
        rspackConfig: bundlerConfigs,
        rsbuildConfig: rsbuildConfig,
        isSuccess: Boolean(rsbuildInstance),
      },
    };
  }

  const results = await getResults(rslibConfig, type);
  return {
    contents: results.contents,
    files: results.files,
    entries: results.entries,
    entryFiles: results.entryFiles,
    rspackConfig: bundlerConfigs,
    rsbuildConfig: rsbuildConfig,
    isSuccess: Boolean(rsbuildInstance),
  };
}

interface FileTree {
  [key: string]: string | FileTree;
}

export function generateFileTree(dir: string) {
  const files = fs.readdirSync(dir);
  const fileTree: FileTree = {};

  for (const file of files) {
    const filePath = join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      fileTree[file] = generateFileTree(filePath);
    } else {
      fileTree[file] = filePath;
    }
  }

  return fileTree;
}

export function getFileBySuffix(
  files: Record<string, string>,
  suffix: string,
): string {
  const fileName = Object.keys(files).find((file) => file.endsWith(suffix));
  assert(fileName);
  const content = files[fileName];
  assert(content);
  return content;
}
