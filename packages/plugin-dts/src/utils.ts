import fs, { writeFileSync } from 'node:fs';
import path from 'node:path';
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
  writeFileSync(gitIgnorePath, '**/*\n');

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
