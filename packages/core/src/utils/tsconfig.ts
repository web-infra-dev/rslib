import path from 'node:path';
import ts from 'typescript';

export function loadTsconfig(tsconfigPath: string): ts.ParsedCommandLine {
  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  const configFileContent = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(tsconfigPath),
  );

  return configFileContent;
}

export function getTsconfigCompilerOptions(
  tsconfigPath: string,
): ts.CompilerOptions {
  const { options } = loadTsconfig(tsconfigPath);

  return options;
}
