import assert from 'node:assert';
import fs from 'node:fs';
import { basename, dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
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

export function generateBundleMFConfig(
  options: Parameters<typeof pluginModuleFederation>[0],
  config: LibConfig = {},
): LibConfig {
  const mfBasicConfig: LibConfig = {
    format: 'mf',
    output: {
      distPath: {
        root: './dist/mf',
      },
    },
    plugins: [pluginModuleFederation(options)],
  };

  return mergeConfig(mfBasicConfig, config)!;
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
  mfExposeEntry: string | undefined;

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
  let mfExposeEntry: string | undefined;
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
      let mfExposeFile: string | undefined;
      if (fileSet.length === 1) {
        entryFile = fileSet[0];
      } else {
        // TODO: Do not support multiple entry files yet.
        entryFile = fileSet.find((file) => file.includes('index'));
        mfExposeFile = fileSet.find((file) => file.includes('expose'));
      }

      if (typeof entryFile === 'string') {
        entries[key] = content[entryFile]!;
        entryFiles[key] = normalize(entryFile);
      }

      if (typeof mfExposeFile === 'string') {
        mfExposeEntry = content[mfExposeFile]!;
      }
    }
  }

  return {
    files,
    contents,
    entries,
    mfExposeEntry,
    entryFiles,
  };
}

const updateConfigForTest = (rslibConfig: RslibConfig) => {
  Object.assign(rslibConfig, {
    performance: {
      // Do not print file size in tests
      printFileSize: false,
    },
  });
};

export async function rslibBuild({
  cwd,
  path,
  modifyConfig,
  lib,
}: {
  cwd: string;
  path?: string;
  modifyConfig?: (config: RslibConfig) => void;
  lib?: string[];
}) {
  const { content: rslibConfig } = await loadConfig({
    cwd,
    path,
  });
  modifyConfig?.(rslibConfig);
  process.chdir(cwd);
  const rsbuildInstance = await build(rslibConfig, { lib });
  return { rsbuildInstance, rslibConfig };
}

export async function buildAndGetResults(options: {
  fixturePath: string;
  configPath?: string;
  type: 'all';
  lib?: string[];
}): Promise<{
  js: BuildResult;
  dts: BuildResult;
  css: BuildResult;
}>;
export async function buildAndGetResults(options: {
  fixturePath: string;
  configPath?: string;
  type?: 'js' | 'dts' | 'css';
  lib?: string[];
}): Promise<BuildResult>;
export async function buildAndGetResults({
  fixturePath,
  configPath,
  type = 'js',
  lib,
}: {
  fixturePath: string;
  configPath?: string;
  type?: 'js' | 'dts' | 'css' | 'all';
  lib?: string[];
}) {
  const { rsbuildInstance, rslibConfig } = await rslibBuild({
    cwd: fixturePath,
    path: configPath,
    modifyConfig: updateConfigForTest,
    lib,
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
    mfExposeEntry: results.mfExposeEntry,
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

export function queryContent(
  contents: Record<string, string>,
  query: string | RegExp,
  options: {
    basename?: boolean;
  } = {},
): { path: string; content: string } {
  const useBasename = options?.basename ?? false;
  const matched = Object.entries(contents).find(([key]) => {
    const toQueried = useBasename ? basename(key) : key;
    return typeof query === 'string'
      ? toQueried === query
      : query.test(toQueried);
  });

  if (!matched) {
    throw new Error(`Cannot find content for ${query}`);
  }

  return { path: matched[0], content: matched[1] };
}

export async function createTempFiles(
  fixturePath: string,
  bundle: boolean,
): Promise<string[]> {
  const checkFile: string[] = [];

  const tempDirCjs = join(fixturePath, 'dist-types', 'cjs');
  const tempDirEsm = join(fixturePath, 'dist-types', 'esm');
  const tempFileCjs = join(tempDirCjs, 'tempFile.d.ts');
  const tempFileEsm = join(tempDirEsm, 'tempFile.d.ts');

  await fs.promises.mkdir(tempDirCjs, { recursive: true });
  await fs.promises.mkdir(tempDirEsm, { recursive: true });

  await fs.promises.writeFile(tempFileCjs, 'console.log("temp file for cjs");');
  await fs.promises.writeFile(tempFileEsm, 'console.log("temp file for esm");');

  checkFile.push(tempFileCjs, tempFileEsm);

  if (bundle) {
    const tempDirRslib = join(fixturePath, '.rslib', 'declarations', 'cjs');
    const tempDirRslibEsm = join(fixturePath, '.rslib', 'declarations', 'esm');
    const tempFileRslibCjs = join(tempDirRslib, 'tempFile.d.ts');
    const tempFileRslibEsm = join(tempDirRslibEsm, 'tempFile.d.ts');

    await fs.promises.mkdir(tempDirRslib, { recursive: true });
    await fs.promises.mkdir(tempDirRslibEsm, { recursive: true });

    await fs.promises.writeFile(
      tempFileRslibCjs,
      'console.log("temp file for cjs");',
    );
    await fs.promises.writeFile(
      tempFileRslibEsm,
      'console.log("temp file for esm");',
    );

    checkFile.push(tempFileRslibCjs, tempFileRslibEsm);
  }

  return checkFile;
}
