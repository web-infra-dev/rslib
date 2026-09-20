import { JS_EXTENSIONS_PATTERN } from '../constant';
import type { Format, NewUrl, NewUrlMode } from '../types';

export const resolveNewUrlMode = ({
  format,
  newUrlConfig,
}: {
  format: Format;
  newUrlConfig?: NewUrl;
}): NewUrlMode | false => {
  if (newUrlConfig !== undefined && format !== 'esm') {
    throw new Error(
      '"newUrl" only supports the "esm" format. Set "format" to "esm" or omit it.',
    );
  }

  if (newUrlConfig === false) {
    return false;
  }

  return newUrlConfig?.mode ?? 'asset';
};

/**
 * In bundleless `entry` mode a `new URL()` target that is itself a JavaScript or
 * TypeScript module is externalized instead of being copied as an asset, exactly
 * like a `new Worker(new URL(...))` target. The entry glob already compiles that
 * module to its own output, so the URL only has to be redirected to it.
 *
 * Targets of any other type keep the asset behavior, and so does `asset` mode.
 */
export const shouldExternalizeUrlDependency = ({
  mode,
  request,
}: {
  mode: NewUrlMode | false;
  request: string;
}): boolean => mode === 'entry' && JS_EXTENSIONS_PATTERN.test(request);
