import type { ConfigParams, RslibConfig } from '@rslib/core';

export default ({ command }: ConfigParams): RslibConfig => ({
  lib: [],
  source: {
    define: {
      COMMAND: JSON.stringify(command),
    },
  },
});
