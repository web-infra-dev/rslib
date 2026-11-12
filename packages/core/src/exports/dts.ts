import fs from 'node:fs';
import path from 'node:path';
import { getTsconfig } from 'get-tsconfig';
import { normalizeSlash } from '../utils/helper';

/**
 * Resolve the directory declaration files are emitted to, in the same way as
 * rsbuild-plugin-dts: `dts.distPath`, then `declarationDir` in tsconfig, then
 * the JavaScript output directory.
 */
export function resolveDtsDistPath({
  root,
  distPath,
  tsconfigPath = 'tsconfig.json',
  outputPath,
}: {
  root: string;
  /** `dts.distPath`, relative to the root. */
  distPath?: string;
  /** `source.tsconfigPath`, relative to the root. */
  tsconfigPath?: string;
  /** Absolute path of the JavaScript output directory. */
  outputPath: string;
}): string {
  if (distPath) return path.resolve(root, distPath);

  // Like `tsc`, search for the tsconfig file from the root up.
  const isAbsolute = path.isAbsolute(tsconfigPath);
  const tsconfig =
    isAbsolute && !fs.existsSync(tsconfigPath)
      ? undefined
      : getTsconfig(isAbsolute ? path.dirname(tsconfigPath) : root, {
          configName: isAbsolute ? path.basename(tsconfigPath) : tsconfigPath,
          typescriptVersion: false,
        });
  // get-tsconfig keeps path-like options relative to the tsconfig file.
  const declarationDir = tsconfig?.config.compilerOptions?.declarationDir;
  return declarationDir
    ? path.resolve(path.dirname(tsconfig.path), declarationDir)
    : outputPath;
}

// TypeScript looks up the declaration file next to the resolved JavaScript file
// with the matching extension, and never falls back to other extensions.
const MATCHED_DECLARATION_EXTENSIONS: Record<string, string> = {
  '.js': '.d.ts',
  '.jsx': '.d.ts',
  '.mjs': '.d.mts',
  '.cjs': '.d.cts',
};

const DECLARATION_EXTENSIONS = ['.d.ts', '.d.mts', '.d.cts'];

export type DeclarationFile = {
  /** Path relative to the package root, using forward slashes. */
  file: string;
  /** Whether TypeScript can resolve it from the JavaScript file without a `types` condition. */
  matched: boolean;
};

/**
 * Find the declaration file of a JavaScript output, preferring the one with the
 * matching extension. It is looked up at the same relative path under
 * `dtsDistPath`, which is next to the output unless declaration files are
 * emitted to another directory, where TypeScript cannot resolve it on its own.
 */
export function findDeclarationFile({
  jsFile,
  root,
  outputPath,
  dtsDistPath,
}: {
  /** Path relative to the package root. */
  jsFile: string;
  root: string;
  /** Absolute path of the JavaScript output directory. */
  outputPath: string;
  /** Absolute path of the declaration output directory. */
  dtsDistPath: string;
}): DeclarationFile | undefined {
  const ext = path.extname(jsFile);
  // Callers only pass JavaScript outputs, whose extensions are all listed.
  const matchedExt = MATCHED_DECLARATION_EXTENSIONS[ext]!;

  const jsPath = path.join(root, jsFile);
  const nextToOutput = path.resolve(dtsDistPath) === path.resolve(outputPath);
  const base = (
    nextToOutput
      ? jsPath
      : path.join(dtsDistPath, path.relative(outputPath, jsPath))
  ).slice(0, -ext.length);

  const declarationExt = [
    matchedExt,
    ...DECLARATION_EXTENSIONS.filter((otherExt) => otherExt !== matchedExt),
  ].find((candidate) => fs.existsSync(base + candidate));

  if (!declarationExt) return;
  return {
    file: normalizeSlash(path.relative(root, base + declarationExt)),
    matched: nextToOutput && declarationExt === matchedExt,
  };
}
