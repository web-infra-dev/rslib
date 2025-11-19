import type { Rspack } from '@rsbuild/core';

// Empty loader, only to make doppelganger of entry module.
const loader: Rspack.LoaderDefinition = function loader(source) {
  return source;
};

export default loader;
