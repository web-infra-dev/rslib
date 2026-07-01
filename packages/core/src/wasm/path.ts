import path from 'node:path';
import { type Rspack, rspack } from '@rsbuild/core';

// Path helpers for wasm preserve mode. They compute where a wasm file is
// emitted and which request should be written back to the output JS.

const computeWasmContentHash = (
  bytes: Buffer,
  compiler: Rspack.Compiler,
): string => {
  const hash = rspack.util.createHash(
    compiler.options.output.hashFunction!,
  );
  if (compiler.options.output.hashSalt) {
    hash.update(Buffer.from(compiler.options.output.hashSalt));
  }
  hash.update(Buffer.from(bytes));
  return hash.digest(compiler.options.output.hashDigest ?? 'hex');
};

const getSourceFilenamePathData = (sourcePath: string): string => {
  const parsed = path.parse(sourcePath);
  return `${parsed.name}${parsed.ext}`;
};

const getAssetPathData = ({
  bytes,
  compiler,
  sourcePath,
}: {
  bytes: Buffer;
  compiler: Rspack.Compiler;
  sourcePath: string;
}): {
  filename: string;
  hash: string;
  contentHash: string;
} => {
  const contentHash = computeWasmContentHash(bytes, compiler);
  return {
    filename: getSourceFilenamePathData(sourcePath),
    hash: contentHash,
    contentHash,
  };
};

// Compute the emitted asset path using Rspack's wasm filename template.
export const getAssetEmitPath = ({
  bytes,
  compiler,
  compilation,
  filenameTemplate,
  sourcePath,
}: {
  bytes: Buffer;
  compiler: Rspack.Compiler;
  compilation: Rspack.Compilation;
  filenameTemplate: string;
  sourcePath: string;
}): {
  filename: string;
  info: Record<string, unknown>;
} => {
  const { path: filename, info } = compilation.getAssetPathWithInfo(
    filenameTemplate,
    getAssetPathData({ bytes, compiler, sourcePath }),
  );
  return { filename, info: info as Record<string, unknown> };
};

// Read the wasm filename template configured on the current compilation.
export const getWebassemblyModuleFilename = (
  compilation: Rspack.Compilation,
): string => {
  const filename = compilation.outputOptions.webassemblyModuleFilename;
  if (!filename) {
    throw new Error(
      'Rspack output.webassemblyModuleFilename is required for wasm preserve asset emit.',
    );
  }
  return filename;
};

// Compute the dist-relative emit path for a preserved wasm file.
export const computeEmitDistRelPath = ({
  bytes,
  compiler,
  compilation,
  outBase,
  preserveToSource,
  sourcePath,
}: {
  bytes: Buffer;
  compiler: Rspack.Compiler;
  compilation: Rspack.Compilation;
  outBase: string | null;
  preserveToSource: boolean;
  sourcePath: string;
}): string => {
  if (outBase && preserveToSource) {
    return path.relative(outBase, sourcePath).split(path.sep).join('/');
  }
  return getAssetEmitPath({
    bytes,
    compiler,
    compilation,
    filenameTemplate: getWebassemblyModuleFilename(compilation),
    sourcePath,
  }).filename;
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
  outBase: string | null,
  emitDistRelPath: string,
): string => {
  if (outBase && issuer) {
    const issuerRelToOutBase = path.relative(outBase, issuer);
    const issuerDistDir = path.dirname(issuerRelToOutBase);
    const fromDir = issuerDistDir === '.' || issuerDistDir === ''
      ? '.'
      : issuerDistDir;
    return ensureDotPrefix(path.posix.relative(
      fromDir.split(path.sep).join('/'),
      emitDistRelPath,
    ));
  }
  return ensureDotPrefix(emitDistRelPath);
};
