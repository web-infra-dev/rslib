import fs from 'node:fs';
import path from 'node:path';
import { logger } from '@rsbuild/core';
import fg from 'fast-glob';
import color from 'picocolors';
import * as ts from 'typescript';

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

  const gitIgnorePath = path.join(cwd, `${TEMP_FOLDER}/.gitignore`);
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

export function getTimeCost(start: number): string {
  return `${Math.floor(Date.now() - start)}ms`;
}

export async function processDtsFiles(
  bundle: boolean,
  dir: string,
  dtsExtension: string,
): Promise<void> {
  if (bundle) {
    return;
  }

  const dtsFiles = await fg(`${dir}/**/*.d.ts`);

  for (const file of dtsFiles) {
    try {
      const newFile = file.replace('.d.ts', dtsExtension);
      fs.renameSync(file, newFile);
    } catch (error) {
      logger.error(`Error renaming DTS file ${file}: ${error}`);
    }
  }
}
