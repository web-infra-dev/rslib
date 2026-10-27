import fs from 'node:fs';
import path from 'node:path';
import { normalizeSlash } from '../utils/helper';

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
 * matching extension. It is looked up next to the output, or at the same
 * relative path under `dtsDistPath` when declaration files are emitted to
 * another directory, where TypeScript cannot resolve it on its own.
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
  /** Absolute path of `dts.distPath`. */
  dtsDistPath?: string;
}): DeclarationFile | undefined {
  const ext = path.extname(jsFile);
  // Callers only pass JavaScript outputs, whose extensions are all listed.
  const matchedExt = MATCHED_DECLARATION_EXTENSIONS[ext]!;

  const jsPath = path.join(root, jsFile);
  const nextToOutput =
    dtsDistPath === undefined ||
    path.resolve(dtsDistPath) === path.resolve(outputPath);
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
