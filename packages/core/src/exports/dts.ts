import fs from 'node:fs';
import path from 'node:path';

// TypeScript looks up the declaration file next to the resolved JavaScript file
// with the matching extension, and never falls back to other extensions.
const DECLARATION_EXTENSIONS: Record<string, string> = {
  '.js': '.d.ts',
  '.jsx': '.d.ts',
  '.mjs': '.d.mts',
  '.cjs': '.d.cts',
};

export type DeclarationFile = {
  /** Path relative to the package root, using forward slashes. */
  file: string;
  /** Whether TypeScript can resolve it from the JavaScript file without a `types` condition. */
  matched: boolean;
};

function replaceExtension(file: string, ext: string, newExt: string): string {
  return `${file.slice(0, -ext.length)}${newExt}`;
}

/**
 * Find the declaration file next to a JavaScript output, preferring the one
 * with the matching extension.
 */
export function findDeclarationFile(
  jsFile: string,
  root: string,
  exists: (file: string) => boolean = fs.existsSync,
): DeclarationFile | undefined {
  const ext = path.extname(jsFile);
  const matchedExt = DECLARATION_EXTENSIONS[ext];
  if (!matchedExt) return;

  const candidates = new Set([
    matchedExt,
    ...Object.values(DECLARATION_EXTENSIONS),
  ]);
  for (const declarationExt of candidates) {
    const file = replaceExtension(jsFile, ext, declarationExt);
    if (exists(path.join(root, file))) {
      return { file, matched: declarationExt === matchedExt };
    }
  }
  return;
}

export function formatMissingDeclarations(libIds: string[]): string {
  return [
    `Failed to generate the "exports" field because no declaration files were found next to the outputs of the following libs that emit declaration files: ${libIds.map((id) => `"${id}"`).join(', ')}.`,
    'Emit declaration files to the same directory as the JavaScript outputs, check "dts.distPath", and the "declarationDir" and "rootDir" options in tsconfig.',
  ].join('\n');
}
