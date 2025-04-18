import fs from 'node:fs';
import fsP from 'node:fs/promises';
import { platform } from 'node:os';
import path, {
  basename,
  dirname,
  extname,
  join,
  normalize,
  relative,
  resolve,
} from 'node:path';
import { type NapiConfig, parseAsync } from '@ast-grep/napi';
import { type RsbuildConfig, logger } from '@rsbuild/core';
import MagicString from 'magic-string';
import color from 'picocolors';
import { convertPathToPattern, glob } from 'tinyglobby';
import { type MatchPath, createMatchPath, loadConfig } from 'tsconfig-paths';
import ts from 'typescript';
import type { DtsEntry, DtsRedirect } from './index';

const JS_EXTENSIONS: string[] = [
  'js',
  'mjs',
  'jsx',
  '(?<!\\.d\\.)ts', // ignore d.ts,
  '(?<!\\.d\\.)mts', // ditto
  '(?<!\\.d\\.)cts', // ditto
  'tsx',
  'cjs',
  'cjsx',
  'mjsx',
  'mtsx',
  'ctsx',
] as const;

export const JS_EXTENSIONS_PATTERN: RegExp = new RegExp(
  `\\.(${JS_EXTENSIONS.join('|')})$`,
);

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

export function ensureTempDeclarationDir(cwd: string, name: string): string {
  const dirPath = path.join(cwd, TEMP_DTS_DIR, name);

  if (fs.existsSync(dirPath)) {
    return dirPath;
  }

  fs.mkdirSync(dirPath, { recursive: true });

  const gitIgnorePath = path.join(cwd, TEMP_FOLDER, '.gitignore');
  fs.writeFileSync(gitIgnorePath, '**/*\n');

  return dirPath;
}

export async function pathExists(path: string): Promise<boolean> {
  return fs.promises
    .access(path)
    .then(() => true)
    .catch(() => false);
}

export async function isDirectory(filePath: string): Promise<boolean> {
  try {
    const stat = await fsP.stat(filePath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

export async function emptyDir(dir: string): Promise<void> {
  if (!(await pathExists(dir))) {
    return;
  }

  try {
    for (const file of await fs.promises.readdir(dir)) {
      await fs.promises.rm(path.resolve(dir, file), {
        recursive: true,
        force: true,
      });
    }
  } catch (err) {
    logger.warn(`Failed to empty dir: ${dir}`);
    logger.warn(err);
  }
}

export async function clearTempDeclarationDir(cwd: string): Promise<void> {
  const dirPath = path.join(cwd, TEMP_DTS_DIR);

  await emptyDir(dirPath);
}

export function getFileLoc(
  diagnostic: ts.Diagnostic,
  configPath: string,
): string {
  if (diagnostic.file) {
    const { line, character } = ts.getLineAndCharacterOfPosition(
      diagnostic.file,
      diagnostic.start!,
    );
    return `${color.cyan(diagnostic.file.fileName)}:${color.yellow(line + 1)}:${color.yellow(character + 1)}`;
  }

  return `${color.cyan(configPath)}`;
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

// tinyglobby only accepts posix path
// https://github.com/SuperchupuDev/tinyglobby?tab=readme-ov-file#api
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

export async function addBannerAndFooter(
  dtsFile: string,
  banner?: string,
  footer?: string,
): Promise<void> {
  const content = await fsP.readFile(dtsFile, 'utf-8');
  const code = new MagicString(content);

  if (banner && !content.trimStart().startsWith(banner.trim())) {
    code.prepend(`${banner}\n`);
  }

  if (footer && !content.trimEnd().endsWith(footer.trim())) {
    code.append(`\n${footer}\n`);
  }

  if (code.hasChanged()) {
    await fsP.writeFile(dtsFile, code.toString());
  }
}

async function addExtension(
  redirect: DtsRedirect,
  dtsFile: string,
  path: string,
  extension: string,
): Promise<string> {
  if (!redirect.extension) {
    return path;
  }

  let redirectPath = path;

  // If the import path refers to a directory, it most likely actually refers to a `index.*` file due to Node's module resolution
  if (await isDirectory(join(dirname(dtsFile), redirectPath))) {
    // This uses `/` instead of `path.join` here because `join` removes potential "./" prefixes
    redirectPath = `${redirectPath}/index`;
  }

  return `${redirectPath}${extension}`;
}

export async function redirectDtsImports(
  dtsFile: string,
  dtsExtension: string,
  redirect: DtsRedirect,
  matchPath: MatchPath,
  outDir: string,
  rootDir: string,
): Promise<void> {
  const content = await fsP.readFile(dtsFile, 'utf-8');
  const code = new MagicString(content);
  const sgNode = (await parseAsync('typescript', content)).root();
  const matcher: NapiConfig = {
    rule: {
      any: [
        {
          kind: 'import_statement',
          has: {
            field: 'source',
            has: {
              pattern: '$IMP',
              kind: 'string_fragment',
            },
          },
        },
        {
          kind: 'export_statement',
          has: {
            field: 'source',
            has: {
              pattern: '$IMP',
              kind: 'string_fragment',
            },
          },
        },
        {
          any: [{ pattern: 'require($A)' }, { pattern: 'import($A)' }],
          has: {
            field: 'arguments',
            has: {
              has: {
                pattern: '$IMP',
                kind: 'string_fragment',
              },
            },
          },
        },
      ],
    },
  };
  const matchModule = sgNode.findAll(matcher).map((match) => {
    // we can guarantee $IMP is matched given the rule
    const matchNode = match.getMatch('IMP')!;
    return {
      n: matchNode.text(),
      s: matchNode.range().start.index,
      e: matchNode.range().end.index,
    };
  });
  const extension = dtsExtension
    .replace(/\.d\.ts$/, '.js')
    .replace(/\.d\.cts$/, '.cjs')
    .replace(/\.d\.mts$/, '.mjs');

  for (const imp of matchModule) {
    const { n: importPath, s: start, e: end } = imp;

    if (!importPath) continue;

    try {
      const absoluteImportPath = matchPath(importPath, undefined, undefined, [
        '.jsx',
        '.tsx',
        '.js',
        '.ts',
        '.mjs',
        '.mts',
        '.cjs',
        '.cts',
      ]);

      let redirectImportPath = importPath;

      if (absoluteImportPath && redirect.path) {
        const isOutsideRootdir = !normalize(absoluteImportPath).startsWith(
          normalize(rootDir) + path.sep,
        );

        if (isOutsideRootdir) {
          const relativePath = relative(dirname(dtsFile), absoluteImportPath);
          redirectImportPath = relativePath.startsWith('..')
            ? relativePath
            : `./${relativePath}`;
        } else {
          const originalFilePath = resolve(rootDir, relative(outDir, dtsFile));
          const originalSourceDir = dirname(originalFilePath);
          const relativePath = relative(originalSourceDir, absoluteImportPath);
          redirectImportPath = relativePath.startsWith('..')
            ? relativePath
            : `./${relativePath}`;
        }
      }

      const ext = extname(redirectImportPath);

      if (ext) {
        if (JS_EXTENSIONS_PATTERN.test(redirectImportPath)) {
          if (redirect.extension) {
            redirectImportPath = redirectImportPath.replace(
              /\.[^.]+$/,
              extension,
            );
          }
        }
      } else {
        if (
          absoluteImportPath &&
          normalize(absoluteImportPath).startsWith(normalize(rootDir))
        ) {
          redirectImportPath = await addExtension(
            redirect,
            dtsFile,
            redirectImportPath,
            extension,
          );
        }

        if (!absoluteImportPath && importPath.startsWith('.')) {
          redirectImportPath = await addExtension(
            redirect,
            dtsFile,
            redirectImportPath,
            extension,
          );
        }
      }

      const normalizedRedirectImportPath = redirectImportPath
        .split(path.sep)
        .join('/');

      code.overwrite(start, end, normalizedRedirectImportPath);
    } catch (err) {
      logger.warn(err);
    }
  }

  if (code.hasChanged()) {
    await fsP.writeFile(dtsFile, code.toString());
  }
}

export async function processDtsFiles(
  bundle: boolean,
  dir: string,
  dtsExtension: string,
  redirect: DtsRedirect,
  tsconfigPath: string,
  rootDir: string,
  banner?: string,
  footer?: string,
): Promise<void> {
  if (bundle) {
    return;
  }

  let matchPath: MatchPath | undefined;

  if (redirect.path || redirect.extension) {
    const result = loadConfig(tsconfigPath);

    if (result.resultType === 'failed') {
      logger.error(result.message);
      return;
    }

    const { absoluteBaseUrl, paths, mainFields, addMatchAll } = result;
    matchPath = createMatchPath(
      absoluteBaseUrl,
      paths,
      mainFields,
      addMatchAll,
    );
  }

  const dtsFiles = await glob(convertPath(join(dir, '/**/*.d.ts')), {
    absolute: true,
  });

  await Promise.all(
    dtsFiles.map(async (file) => {
      try {
        if (banner || footer) {
          await addBannerAndFooter(file, banner, footer);
        }

        if ((redirect.path || redirect.extension) && matchPath) {
          await redirectDtsImports(
            file,
            dtsExtension,
            redirect,
            matchPath,
            dir,
            rootDir,
          );
        }

        const newFile = file.replace('.d.ts', dtsExtension);
        await fsP.rename(file, newFile);
      } catch (error) {
        logger.error(`Failed to rename declaration file ${file}: ${error}`);
      }
    }),
  );
}

export function processSourceEntry(
  bundle: boolean,
  entryConfig: NonNullable<RsbuildConfig['source']>['entry'],
): DtsEntry[] {
  if (!bundle) {
    return [];
  }

  if (
    entryConfig &&
    Object.values(entryConfig).every((val) => typeof val === 'string')
  ) {
    const entries = Object.entries(entryConfig as Record<string, string>).map(
      ([name, path]) => ({
        name,
        path,
      }),
    );

    if (entries.length === 0) {
      throw new Error(
        `Can not find a valid entry for ${color.cyan('dts.bundle')} option, please check your entry config.`,
      );
    }

    return entries;
  }

  throw new Error(
    '@microsoft/api-extractor only support entry of Record<string, string> type to bundle declaration files, please check your entry config.',
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

export async function cleanDtsFiles(dir: string): Promise<void> {
  const patterns = ['/**/*.d.ts', '/**/*.d.cts', '/**/*.d.mts'];
  const files = await Promise.all(
    patterns.map((pattern) =>
      glob(convertPath(join(dir, pattern)), { absolute: true }),
    ),
  );

  const allFiles = files.flat();

  await Promise.all(allFiles.map((file) => fsP.rm(file, { force: true })));
}

export async function cleanTsBuildInfoFile(
  tsconfigPath: string,
  compilerOptions: ts.CompilerOptions,
): Promise<void> {
  const tsconfigDir = dirname(tsconfigPath);
  const { outDir, rootDir, tsBuildInfoFile } = compilerOptions;
  let tsbuildInfoFilePath = `${basename(
    tsconfigPath,
    '.json',
  )}${tsBuildInfoFile ?? '.tsbuildinfo'}`;
  if (outDir) {
    if (rootDir) {
      tsbuildInfoFilePath = join(
        outDir,
        relative(resolve(tsconfigDir, rootDir), tsconfigDir),
        tsbuildInfoFilePath,
      );
    } else {
      tsbuildInfoFilePath = join(outDir, tsbuildInfoFilePath);
    }
  }

  if (await pathExists(tsbuildInfoFilePath)) {
    await fsP.rm(tsbuildInfoFilePath, { force: true });
  }
}

// the priority of dtsEmitPath is dts.distPath > declarationDir > output.distPath.root
// outDir is not considered since in multiple formats, the dts files may not in the same directory as the js files
export function getDtsEmitPath(
  pathFromPlugin: string | undefined,
  declarationDir: string | undefined,
  distPath: string,
): string {
  return pathFromPlugin ?? declarationDir ?? distPath;
}

export function warnIfOutside(
  cwd: string,
  dir: string | undefined,
  label: string,
): void {
  if (dir) {
    const normalizedCwd = normalize(cwd);
    const normalizedDir = normalize(dir);
    const relDir = relative(normalizedCwd, normalizedDir);

    if (relDir.startsWith('..')) {
      logger.warn(
        `The resolved ${label} ${color.cyan(normalizedDir)} is outside the project root ${color.cyan(normalizedCwd)}, please check your tsconfig file.`,
      );
    }
  }
}
