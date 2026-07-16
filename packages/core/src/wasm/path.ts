import path from 'node:path';

/**
 * Convert a platform-specific file path to a forward-slash path.
 *
 * @param value A file path that may contain platform-specific separators.
 * @returns The same path using `/` as the separator.
 * @example
 * normalizePath(path.join('src', 'wasm', 'add.wasm'));
 * // => 'src/wasm/add.wasm'
 */
export const normalizePath = (value: string): string =>
  value.split(path.sep).join('/');

/**
 * Convert a normalized relative path to an ESM relative module specifier.
 *
 * @param value A forward-slash path relative to the importing module.
 * @returns The path prefixed with `./` when it does not already start with
 * `./` or `../`.
 * @example
 * toRelativeModuleSpecifier('wasm/add.wasm');
 * // => './wasm/add.wasm'
 */
export const toRelativeModuleSpecifier = (value: string): string =>
  value.startsWith('./') || value.startsWith('../') ? value : `./${value}`;

/**
 * Compute the output path of a preserved wasm file relative to the dist root.
 *
 * @param bundle Whether the JavaScript output is bundled.
 * @param outBase The absolute source base used by bundleless output.
 * @param sourcePath The absolute path of the source wasm file.
 * @param wasmDistDir The dist-relative wasm directory used by bundle output.
 * @returns A forward-slash path relative to the dist root.
 * @example
 * computeWasmEmitPath({
 *   bundle: false,
 *   outBase: '/project/src',
 *   sourcePath: '/project/src/wasm/add.wasm',
 *   wasmDistDir: 'static/wasm',
 * });
 * // => 'wasm/add.wasm'
 */
export const computeWasmEmitPath = ({
  bundle,
  outBase,
  sourcePath,
  wasmDistDir,
}: {
  bundle: boolean;
  outBase: string | null;
  sourcePath: string;
  wasmDistDir: string;
}): string => {
  if (bundle) {
    return path.posix.join(wasmDistDir, path.basename(sourcePath));
  }

  return normalizePath(path.relative(outBase!, sourcePath));
};

/**
 * Compute the ESM request from emitted JavaScript to a preserved wasm file.
 *
 * @param bundle Whether the JavaScript output is bundled.
 * @param outBase The absolute source base used by bundleless output.
 * @param issuer The absolute path of the source JavaScript module.
 * @param emitPath The wasm output path relative to the dist root.
 * @returns A relative ESM module specifier using forward slashes.
 * @example
 * computeWasmRequest({
 *   bundle: false,
 *   outBase: '/project/src',
 *   issuer: '/project/src/lib/index.js',
 *   emitPath: 'wasm/add.wasm',
 * });
 * // => '../wasm/add.wasm'
 */
export const computeWasmRequest = ({
  bundle,
  outBase,
  issuer,
  emitPath,
}: {
  bundle: boolean;
  outBase: string | null;
  issuer: string;
  emitPath: string;
}): string => {
  if (bundle) {
    return toRelativeModuleSpecifier(emitPath);
  }

  const issuerDir = issuer
    ? normalizePath(path.dirname(path.relative(outBase!, issuer)))
    : '.';

  return toRelativeModuleSpecifier(path.posix.relative(issuerDir, emitPath));
};
