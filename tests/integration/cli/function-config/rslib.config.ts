import type { ConfigParams, RslibConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default ({ command, env, envMode }: ConfigParams): RslibConfig => ({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: `dist/${env}-${envMode}-${command}`,
      },
    }),
  ],
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
});
