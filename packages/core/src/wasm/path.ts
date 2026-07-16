import path from 'node:path';

// Path helpers for wasm preserve mode. They compute where a wasm file is
// emitted and which request should be written back to the output JS.

// Compute the dist-relative emit path for a preserved wasm file.
// - bundleless keeps the source-relative layout under `outBase`.
// - bundle emits the source file name under the wasm dist dir.
export const computeEmitDistRelPath = ({
  outBase,
  preserveToSource,
  sourcePath,
  wasmDistDir,
}: {
  outBase?: string;
  preserveToSource: boolean;
  sourcePath: string;
  wasmDistDir: string;
}): string => {
  if (outBase && preserveToSource) {
    return path.relative(outBase, sourcePath).split(path.sep).join('/');
  }
  return path.posix.join(wasmDistDir, path.basename(sourcePath));
};

const ensureDotPrefix = (rel: string): string => {
  const normalized = rel.split(path.sep).join('/');
  if (normalized.startsWith('./') || normalized.startsWith('../')) {
    return normalized;
  }
  return `./${normalized}`;
};

// Compute the relative ESM import request from an output JS file to wasm.
export const computeRequestFromIssuer = (
  issuer: string,
  outBase: string | undefined,
  emitDistRelPath: string,
): string => {
  if (outBase && issuer) {
    const issuerRelToOutBase = path.relative(outBase, issuer);
    const issuerDistDir = path.dirname(issuerRelToOutBase);
    const fromDir =
      issuerDistDir === '.' || issuerDistDir === '' ? '.' : issuerDistDir;
    return ensureDotPrefix(
      path.posix.relative(fromDir.split(path.sep).join('/'), emitDistRelPath),
    );
  }
  return ensureDotPrefix(emitDistRelPath);
};
