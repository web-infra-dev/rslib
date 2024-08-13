import fs from 'node:fs';
import fsP from 'node:fs/promises';
import { platform } from 'node:os';
import path, { join } from 'node:path';
import { type RsbuildConfig, logger } from '@rsbuild/core';
import fg from 'fast-glob';
import color from 'picocolors';
import type { DtsEntry } from 'src';
import * as ts from 'typescript';

const { convertPathToPattern } = fg;

export function loadTsconfig(tsconfigPath: string): ts.ParsedCommandLine {
  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  const configFileContent = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(tsconfigPath),
  );

  return configFileContent;
}

export const TEMP_FOLDER = '.rslib';
export const TEMP_DTS_DIR: string = `${TEMP_FOLDER}/declarations`;

export function ensureTempDeclarationDir(cwd: string): string {
  const dirPath = path.join(cwd, TEMP_DTS_DIR);

  if (fs.existsSync(dirPath)) {
    return dirPath;
  }

  fs.mkdirSync(dirPath, { recursive: true });

  const gitIgnorePath = path.join(cwd, TEMP_FOLDER, '.gitignore');
  fs.writeFileSync(gitIgnorePath, '**/*\n');

  return dirPath;
}

export function getFileLoc(diagnostic: ts.Diagnostic): string {
  if (diagnostic.file) {
    const { line, character } = ts.getLineAndCharacterOfPosition(
      diagnostic.file,
      diagnostic.start!,
    );
    return `${color.cyan(diagnostic.file.fileName)}:${color.yellow(line + 1)}:${color.yellow(character + 1)}`;
  }

  return '';
}

export const prettyTime = (seconds: number): string => {
  const format = (time: string) => color.bold(time);

  if (seconds < 10) {
    const digits = seconds >= 0.01 ? 2 : 3;
    return `${format(seconds.toFixed(digits))} s`;
  }

  if (seconds < 60) {
    return `${format(seconds.toFixed(1))} s`;
  }

  const minutes = seconds / 60;
  return `${format(minutes.toFixed(2))} m`;
};

// fast-glob only accepts posix path
// https://github.com/mrmlnc/fast-glob#convertpathtopatternpath
const convertPath = (path: string) => {
  if (platform() === 'win32') {
    return convertPathToPattern(path);
  }
  return path;
};

export function getTimeCost(start: number): string {
  const second = (Date.now() - start) / 1000;
  return prettyTime(second);
}

export async function processDtsFiles(
  bundle: boolean,
  dir: string,
  dtsExtension: string,
): Promise<void> {
  if (bundle) {
    return;
  }

  const dtsFiles = await fg(convertPath(join(dir, '/**/*.d.ts')));

  console.log('11111 fg', dir, 'dtsFiles', dtsFiles);

  for (const file of dtsFiles) {
    try {
      const newFile = file.replace('.d.ts', dtsExtension);
      fs.renameSync(file, newFile);
    } catch (error) {
      logger.error(`Error renaming DTS file ${file}: ${error}`);
    }
  }
}

export function processSourceEntry(
  bundle: boolean,
  entryConfig: NonNullable<RsbuildConfig['source']>['entry'],
): DtsEntry {
  if (!bundle) {
    return {
      name: undefined,
      path: undefined,
    };
  }

  if (
    entryConfig &&
    Object.values(entryConfig).every((val) => typeof val === 'string')
  ) {
    return {
      name: Object.keys(entryConfig)[0] as string,
      path: Object.values(entryConfig)[0] as string,
    };
  }

  throw new Error(
    '@microsoft/api-extractor only support single entry of Record<string, string> type to bundle DTS, please check your entry config.',
  );
}

// same as @rslib/core, we should extract into a single published package to share
export async function calcLongestCommonPath(
  absPaths: string[],
): Promise<string | null> {
  if (absPaths.length === 0) {
    return null;
  }

  // we support two cases
  // 1. /packages-a/src/index.ts
  // 2. D:/packages-a/src/index.ts
  const sep = path.posix.sep as '/';

  const splitPaths = absPaths.map((p) => p.split(sep));
  let lcaFragments = splitPaths[0]!;
  for (let i = 1; i < splitPaths.length; i++) {
    const currentPath = splitPaths[i]!;
    const minLength = Math.min(lcaFragments.length, currentPath.length);

    let j = 0;
    while (j < minLength && lcaFragments[j] === currentPath[j]) {
      j++;
    }

    lcaFragments = lcaFragments.slice(0, j);
  }

  let lca = lcaFragments.length > 0 ? lcaFragments.join(sep) : sep;

  const stats = await fsP.stat(lca);
  if (stats?.isFile()) {
    lca = path.dirname(lca);
  }

  return lca;
}
