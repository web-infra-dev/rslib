import path from 'node:path';
import { normalizeSlash } from '../utils/helper';

const renderJsFilename = (template: string, name: string): string =>
  normalizeSlash(template)
    .replace(/\[name\]/g, () => name)
    .replace(/\[[^\]]+\]/g, 'chunk');

/**
 * Compute the output path of a preserved wasm file relative to the dist root.
 *
 * @param outBase The absolute source base used by bundleless output.
 * @param sourcePath The absolute path of the source wasm file.
 * @returns A forward-slash path relative to the dist root.
 * @example
 * computeWasmEmitPath({
 *   outBase: '/project/src',
 *   sourcePath: '/project/src/wasm/add.wasm',
 * });
 * // => 'wasm/add.wasm'
 */
export const computeWasmEmitPath = ({
  outBase,
  sourcePath,
}: {
  outBase: string;
  sourcePath: string;
}): string => normalizeSlash(path.relative(outBase, sourcePath));

/**
 * Simulate the bundleless JavaScript output path for a source module.
 *
 * @param outBase The absolute source base used by bundleless output.
 * @param issuer The absolute path of the source JavaScript module.
 * @param jsFilename The JavaScript filename template.
 * @returns The JavaScript output path relative to the dist root.
 * @example
 * computeBundlelessJsEmitPath({
 *   outBase: '/project/src',
 *   issuer: '/project/src/lib/index.js',
 *   jsFilename: 'js/[name].js',
 * });
 * // => 'js/lib/index.js'
 */
export const computeBundlelessJsEmitPath = ({
  outBase,
  issuer,
  jsFilename,
}: {
  outBase: string;
  issuer: string;
  jsFilename: string;
}): string => {
  const relativeIssuer = normalizeSlash(path.relative(outBase, issuer));
  const { dir, name } = path.posix.parse(relativeIssuer);
  return renderJsFilename(jsFilename, path.posix.join(dir, name));
};

/**
 * Compute the relative ESM request from an emitted JavaScript file to a
 * preserved wasm file.
 *
 * @param jsEmitPath The JavaScript output path relative to the dist root.
 * @param wasmEmitPath The wasm output path relative to the dist root.
 * @returns A relative ESM module specifier using forward slashes.
 * @example
 * computeWasmRequest({
 *   jsEmitPath: 'js/lib/index.js',
 *   wasmEmitPath: 'lib/add.wasm',
 * });
 * // => '../../lib/add.wasm'
 */
export const computeWasmRequest = ({
  jsEmitPath,
  wasmEmitPath,
}: {
  jsEmitPath: string;
  wasmEmitPath: string;
}): string => {
  const relativePath = path.posix.relative(
    path.posix.dirname(jsEmitPath),
    wasmEmitPath,
  );

  // path.relative omits `./` for files in the same directory or a child
  // directory, but an ESM relative specifier must start with `./` or `../`.
  return relativePath.startsWith('../') ? relativePath : `./${relativePath}`;
};
