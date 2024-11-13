import os from 'node:os';
import type { LoaderDefinition } from '@rspack/core';
import {
  REACT_DIRECTIVE_REGEX,
  RSLIB_ENTRY_QUERY,
  SHEBANG_REGEX,
} from '../constant';

const loader: LoaderDefinition = function loader(source) {
  let result = source;

  if (this.resourceQuery === `?${RSLIB_ENTRY_QUERY}`) {
    const [firstLine1, ...rest1] = result.split(os.EOL).slice(1);
    if (SHEBANG_REGEX.test(firstLine1!)) {
      result = rest1.join(os.EOL);
    }

    const [firstLine2, ...rest2] = result.split(os.EOL);
    if (REACT_DIRECTIVE_REGEX.test(firstLine2!)) {
      result = rest2.join(os.EOL);
    }
  }

  return result;
};

export default loader;
