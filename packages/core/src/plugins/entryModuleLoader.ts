import os from 'node:os';
import type { LoaderDefinition } from '@rspack/core';
import {
  REACT_DIRECTIVE_REGEX,
  RSLIB_ENTRY_QUERY,
  SHEBANG_PREFIX,
} from '../constant';

const loader: LoaderDefinition = function loader(source) {
  let result = source;

  if (this.resourceQuery === `?${RSLIB_ENTRY_QUERY}`) {
    const rest1 = result.split(os.EOL).slice(1);
    if (source.startsWith(SHEBANG_PREFIX)) {
      result = rest1.join(os.EOL);
    }

    const [firstLine, ...rest2] = result.split(os.EOL);
    if (REACT_DIRECTIVE_REGEX.test(firstLine!)) {
      result = rest2.join(os.EOL);
    }
  }

  return result;
};

export default loader;
