import fs from 'node:fs';
import path from 'node:path';

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
 * Find the declaration file next to a JavaScript output, preferring the one
 * with the matching extension.
 */
export function findDeclarationFile(
  jsFile: string,
  root: string,
): DeclarationFile | undefined {
  const ext = path.extname(jsFile);
  const matchedExt = MATCHED_DECLARATION_EXTENSIONS[ext];
  if (!matchedExt) return;

  const base = jsFile.slice(0, -ext.length);
  const declarationExt = [
    matchedExt,
    ...DECLARATION_EXTENSIONS.filter((otherExt) => otherExt !== matchedExt),
  ].find((candidate) => fs.existsSync(path.join(root, base + candidate)));

  if (!declarationExt) return;
  return {
    file: base + declarationExt,
    matched: declarationExt === matchedExt,
  };
}
